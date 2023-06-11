// Types
import { IStoreApprovalControllerV1 } from './store-approval-v1.controller.type'

// Express
import { Request, Response } from 'express'

// Responses
import { SuccessOk } from '@/app/success/success'

// Prisma
import { PrismaClient, StoreApprovalStatus } from '@prisma/client'
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

// Services
import { StoreService } from '@/store/services/store.service'

// Express Validator
import { body } from 'express-validator'

// Errors
import {
	ErrorBadRequest,
	ErrorForbidden,
	ErrorNotFound,
	ErrorValidation
} from '@/app/errors'

// Services
const storeService = new StoreService()

// Init Prisma
const prisma = new PrismaClient()

export class StoreApprovalControllerV1 implements IStoreApprovalControllerV1 {
	/**
	 * @description Map approval status name
	 *
	 * @return {string} string
	 */
	private _mapApprovalStatusName = (status: StoreApprovalStatus): string => {
		switch (status) {
			case StoreApprovalStatus.OnReview:
				return 'Review'
			case StoreApprovalStatus.Rejected:
				return 'Reject'
			case StoreApprovalStatus.Approved:
				return 'Approve'
			default:
				return status
		}
	}

	/**
	 * @description Handle store approval
	 *
	 *
	 */
	handle = {
		validateInput: [
			body('approvalStatus')
				.not()
				.isEmpty()
				.withMessage('Approval Status is required')
		],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_APPROVAL,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { storeId } = req.params
			const { approvalStatus, rejectReason, reviseComment } = req.body
			const _approvalStatus = approvalStatus as StoreApprovalStatus

			// Get store detail
			const storeDetail = await prisma.store.findFirst({
				where: { id: storeId },
				include: {
					storeApprovals: true
				}
			})

			// Check if store exists
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Get current approval of store
			const currentStoreStatus =
				await storeService.getCurrentStatusStoreApproval(storeDetail.id)

			// Check if status is not value of StoreApprovalStatus type
			if (!Object.values(StoreApprovalStatus).includes(_approvalStatus)) {
				throw new ErrorValidation([
					{ msg: 'Approval status value is invalid', param: 'approvalStatus' }
				])
			}

			// Prevent for jumping approval status
			// e.g, Revise to Approved, without going through Revised first.
			// That example that we don't want!

			// Check if user already approved, reject that!
			if (currentStoreStatus === StoreApprovalStatus.Approved) {
				throw new ErrorBadRequest('Store already been approved')
			}

			// Check if user already reject, reject that
			if (currentStoreStatus === StoreApprovalStatus.Rejected) {
				throw new ErrorBadRequest('Store already been reject')
			}

			// Check if anybody want to go back to Pending or OnReview, reject that!
			const isOnReviewOrPending = [
				StoreApprovalStatus.Pending,
				StoreApprovalStatus.OnReview
			]
				.map(status => status.toString())
				.includes(_approvalStatus)
			if (
				storeDetail.storeApprovals.length > 1 &&
				storeDetail.storeApprovals.some(storeApproval =>
					[StoreApprovalStatus.Pending, StoreApprovalStatus.OnReview]
						.map(status => status.toString())
						.includes(storeApproval.status)
				) &&
				isOnReviewOrPending
			) {
				throw new ErrorBadRequest(
					'Pending, On Review, or Rejected approval cannot have more than one!'
				)
			}

			// Check if current status is Pending and user want to Approved, Reject, Revise, etc.
			// In this case, user must use Rejected / OnReview status
			if (
				currentStoreStatus === StoreApprovalStatus.Pending &&
				![StoreApprovalStatus.Rejected, StoreApprovalStatus.OnReview]
					.map(status => status.toString())
					.includes(_approvalStatus)
			) {
				throw new ErrorBadRequest(
					'Pending approval should be going through On Review or maybe to Rejected!'
				)
			}

			// Check if current status is OnReview and user want to back to Pending, reject that!
			if (
				currentStoreStatus === StoreApprovalStatus.OnReview &&
				_approvalStatus === StoreApprovalStatus.Pending
			) {
				throw new ErrorBadRequest(
					'On Review approval cannot go back to Pending!'
				)
			}

			// Check if current status is Pending, but not going to OnReview
			if (
				currentStoreStatus === StoreApprovalStatus.Pending &&
				_approvalStatus !== StoreApprovalStatus.OnReview
			) {
				throw new ErrorBadRequest('Approval should go to On Review first!')
			}

			// Check if user want to revised, but before is not revise
			if (
				currentStoreStatus !== StoreApprovalStatus.Revise &&
				_approvalStatus === StoreApprovalStatus.Revised
			) {
				throw new ErrorBadRequest('Revised status must Revise first!')
			}

			// Check if current status is Revise and user want to go to other than Revised, reject that!
			if (
				currentStoreStatus === StoreApprovalStatus.Revise &&
				_approvalStatus !== StoreApprovalStatus.Revised
			) {
				throw new ErrorBadRequest('Revise should go to Revised!')
			}

			// Check if user want to revised, reject that!
			// This is only for approval, admin cannot make revised!
			if (_approvalStatus === StoreApprovalStatus.Revised) {
				throw new ErrorBadRequest('You cannot do revised here!')
			}

			// Check if user want to revise, force user to input reviseComment
			if (_approvalStatus === StoreApprovalStatus.Revise && !reviseComment)
				throw new ErrorValidation([
					{ msg: 'Revise Comment is required', param: 'reviseComment' }
				])

			// Check if user want to reject, force user to input rejectReason
			if (_approvalStatus === StoreApprovalStatus.Rejected && !rejectReason)
				throw new ErrorValidation([
					{ msg: 'Reject Reason is required', param: 'rejectReason' }
				])

			// Update store approval
			const updatedStore = await prisma.store.update({
				where: { id: storeId },
				data: {
					status: _approvalStatus,
					storeApprovals: {
						create: {
							rejectReason:
								_approvalStatus === StoreApprovalStatus.Rejected
									? rejectReason
									: undefined,
							reviseComment:
								_approvalStatus === StoreApprovalStatus.Revise
									? reviseComment
									: undefined,
							status: _approvalStatus,
							statusDescription:
								storeService.generateStoreStatusApprovalDescription(
									_approvalStatus
								),
							user: {
								connect: { id: req.currentUser?.id as string }
							}
						}
					}
				},
				include: {
					storeApprovals: true
				}
			})

			const { code, ...restResponse } = SuccessOk({
				result: updatedStore
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Approval status list
	 *
	 *
	 */
	approvalStatusList = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_APPROVAL,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { storeId } = req.params
			let statusList: StoreApprovalStatus[] = []

			// Get store detail
			const storeDetail = await prisma.store.findFirst({
				where: { id: storeId },
				include: {
					storeApprovals: true
				}
			})

			// Check if store exists
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Get current approval of store
			const currentStoreStatus =
				await storeService.getCurrentStatusStoreApproval(storeDetail.id)

			// Handle status list
			switch (currentStoreStatus) {
				case StoreApprovalStatus.Pending:
					statusList.push(StoreApprovalStatus.OnReview)
					break
				case StoreApprovalStatus.OnReview:
					statusList.push(
						StoreApprovalStatus.Rejected,
						StoreApprovalStatus.Revise,
						StoreApprovalStatus.Approved
					)
					break
				case StoreApprovalStatus.Revised:
					statusList.push(
						StoreApprovalStatus.Revise,
						StoreApprovalStatus.Rejected,
						StoreApprovalStatus.Approved
					)
					break
				default:
					statusList = []
			}

			const { code, ...restResponse } = SuccessOk({
				result: statusList.map(status => ({
					id: status,
					name: this._mapApprovalStatusName(status)
				}))
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Cancel store
	 *
	 *
	 */
	cancel = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_APPROVAL,
			permissionActions: EAppPermissionActions.DELETE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { storeId } = req.params

			// Get detail of store
			const storeDetail = await prisma.store.findFirst({
				where: { id: storeId }
			})

			// Check if store exists
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Check for permission for editing
			if (storeDetail.userId !== (req.currentUser?.id as string))
				throw new ErrorForbidden('You cannot perform this action')

			// Get current status of store
			const currentStoreStatus =
				await storeService.getCurrentStatusStoreApproval(storeId)
			if (currentStoreStatus === StoreApprovalStatus.Cancel)
				throw new ErrorBadRequest('Store already been canceled')

			// Restrict if store not inside Pending or Reject.
			if (
				![StoreApprovalStatus.Pending, StoreApprovalStatus.Rejected]
					.map(store => store.toString())
					.includes(currentStoreStatus)
			)
				throw new ErrorBadRequest(
					'You cannot cancel this store, because store is not on Pending, or Reject status'
				)

			// Update store
			const updatedStore = await prisma.store.update({
				where: { id: storeId },
				data: {
					status: StoreApprovalStatus.Cancel,
					storeApprovals: {
						create: {
							status: StoreApprovalStatus.Cancel,
							statusDescription:
								storeService.generateStoreStatusApprovalDescription(
									StoreApprovalStatus.Cancel
								),
							user: {
								connect: { id: req.currentUser?.id as string }
							}
						}
					}
				}
			})

			const { code, ...restResponse } = SuccessOk({
				result: updatedStore
			})
			return res.status(code).json(restResponse)
		}
	}
}
