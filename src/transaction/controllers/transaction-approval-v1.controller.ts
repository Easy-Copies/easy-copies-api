// Types
import { ITransactionApprovalControllerV1 } from './transaction-approval-v1.controller.type'

// Express
import { Request, Response } from 'express'

// Responses
import { SuccessOk } from '@/app/success/success'

// Prisma
import { PrismaClient, TransactionApprovalStatus } from '@prisma/client'
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

// Services
import { TransactionService } from '@/transaction/services/transaction.service'

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
const transactionService = new TransactionService()

// Init Prisma
const prisma = new PrismaClient()

export class TransactionApprovalControllerV1
	implements ITransactionApprovalControllerV1
{
	/**
	 * @description Map approval status name
	 *
	 * @param {TransactionApprovalStatus} status
	 *
	 * @return {string} string
	 */
	private _mapApprovalStatusName = (
		status: TransactionApprovalStatus
	): string => {
		switch (status) {
			case TransactionApprovalStatus.OnProcess:
				return 'Process'
			case TransactionApprovalStatus.ReadyToPickup:
				return 'Ready To Pickup'
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
			permissionCode: EAppPermission.TRANSACTION_MANAGEMENT_APPROVAL,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { transactionId } = req.params
			const { approvalStatus, rejectReason } = req.body
			const _approvalStatus = approvalStatus as TransactionApprovalStatus

			// Get transaction detail
			const transactionDetail = await prisma.transaction.findFirst({
				where: { id: transactionId },
				include: {
					transactionApprovals: true
				}
			})

			// Check if transaction exists
			if (!transactionDetail) throw new ErrorNotFound('Transaction not found')

			// Get current transaction approval status
			const currentTransactionStatus =
				await transactionService.getCurrentStatusTransactionApproval(
					transactionDetail.id
				)

			// Check if status is not value of TransactionApprovalStatus type
			if (!Object.values(TransactionApprovalStatus).includes(_approvalStatus)) {
				throw new ErrorValidation([
					{ msg: 'Approval status value is invalid', param: 'approvalStatus' }
				])
			}

			// Prevent for jumping approval status
			// e.g, Revise to Approved, without going through Revised first.
			// That example that we don't want!

			// Lock if status to be updated
			if (
				[
					TransactionApprovalStatus.Canceled,
					TransactionApprovalStatus.Rejected,
					TransactionApprovalStatus.Done
				]
					.map(approvalStatus => approvalStatus.toString())
					.includes(currentTransactionStatus)
			) {
				throw new ErrorBadRequest(
					'Canceled, Rejected, and Done status cannot be changed!'
				)
			}

			// Check if user want to handle waiting payment in here
			if (
				currentTransactionStatus === TransactionApprovalStatus.WaitingPayment
			) {
				throw new ErrorBadRequest(`Payment not supported in here!`)
			}

			// Check if anybody want to go back to same status, reject that!
			if (
				transactionDetail.transactionApprovals.filter(
					transactionApproval => transactionApproval.status === _approvalStatus
				).length > 0
			) {
				throw new ErrorBadRequest(
					`${_approvalStatus} status cannot have more than one!`
				)
			}

			// Check first if user don't want to reject
			if (_approvalStatus !== TransactionApprovalStatus.Rejected) {
				// Check if user want to cancel in here, reject
				if (_approvalStatus === TransactionApprovalStatus.Canceled) {
					throw new ErrorBadRequest('You cannot do cancel in here!')
				}

				// Check if current status is waiting confirmation, and not go to on process
				if (
					currentTransactionStatus ===
						TransactionApprovalStatus.WaitingConfirmation &&
					_approvalStatus !== TransactionApprovalStatus.OnProcess
				) {
					throw new ErrorBadRequest('You need go to On Process!')
				}

				// Check if current status is on process, and not ready to pickup
				if (
					currentTransactionStatus === TransactionApprovalStatus.OnProcess &&
					_approvalStatus !== TransactionApprovalStatus.ReadyToPickup
				) {
					throw new ErrorBadRequest('You need go to Ready to Pickup!')
				}

				// Check if current status is on process, and not ready to pickup
				if (
					currentTransactionStatus === TransactionApprovalStatus.OnProcess &&
					_approvalStatus !== TransactionApprovalStatus.ReadyToPickup
				) {
					throw new ErrorBadRequest('You need go to Ready to Pickup!')
				}

				// Check if current status is ready to pickup, and not done
				if (
					currentTransactionStatus ===
						TransactionApprovalStatus.ReadyToPickup &&
					_approvalStatus !== TransactionApprovalStatus.Done
				) {
					throw new ErrorBadRequest('You need go to Done!')
				}
			}

			// Check if user want to reject, force user to input rejectReason
			if (
				_approvalStatus === TransactionApprovalStatus.Rejected &&
				!rejectReason
			)
				throw new ErrorValidation([
					{ msg: 'Reject Reason is required', param: 'rejectReason' }
				])

			// Update transaction approval
			const updatedTransaction = await prisma.transaction.update({
				where: { id: transactionId },
				data: {
					status: _approvalStatus,
					transactionApprovals: {
						create: {
							rejectReason:
								_approvalStatus === TransactionApprovalStatus.Rejected
									? rejectReason
									: undefined,
							status: _approvalStatus,
							statusDescription:
								transactionService.generateTransactionStatusApprovalDescription(
									_approvalStatus
								),
							user: {
								connect: { id: req.currentUser?.id as string }
							}
						}
					}
				},
				include: {
					transactionApprovals: true
				}
			})

			const { code, ...restResponse } = SuccessOk({
				result: updatedTransaction
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
			permissionCode: EAppPermission.TRANSACTION_MANAGEMENT_APPROVAL,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { transactionId } = req.params
			let nextStatus: TransactionApprovalStatus | null

			// Get transaction detail
			const transactionDetail = await prisma.transaction.findFirst({
				where: { id: transactionId }
			})

			// Check if transaction exists
			if (!transactionDetail) throw new ErrorNotFound('Transaction not found')

			// Get current approval of transaction
			const currentTransactionStatus =
				await transactionService.getCurrentStatusTransactionApproval(
					transactionDetail.id
				)

			// Handle status list
			switch (currentTransactionStatus) {
				case TransactionApprovalStatus.WaitingConfirmation:
					nextStatus = TransactionApprovalStatus.OnProcess
					break
				case TransactionApprovalStatus.OnProcess:
					nextStatus = TransactionApprovalStatus.ReadyToPickup
					break
				case TransactionApprovalStatus.ReadyToPickup:
					nextStatus = TransactionApprovalStatus.Done
					break
				default:
					nextStatus = null
			}

			const { code, ...restResponse } = SuccessOk({
				result: nextStatus ? this._mapApprovalStatusName(nextStatus) : null
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Cancel transaction
	 *
	 *
	 */
	cancel = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.TRANSACTION_MANAGEMENT_APPROVAL,
			permissionActions: EAppPermissionActions.DELETE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { transactionId } = req.params

			// Get detail of transaction
			const transactionDetail = await prisma.transaction.findFirst({
				where: { id: transactionId }
			})

			// Check if transaction exists
			if (!transactionDetail) throw new ErrorNotFound('Transaction not found')

			// Check for permission for editing
			if (transactionDetail.userId !== (req.currentUser?.id as string))
				throw new ErrorForbidden('You cannot perform this action')

			// Get current status of transaction
			const currentTransactionStatus =
				await transactionService.getCurrentStatusTransactionApproval(
					transactionId
				)
			if (currentTransactionStatus === TransactionApprovalStatus.Canceled)
				throw new ErrorBadRequest('Transaction already been canceled')

			// Restrict if transaction outside TransactionApprovalStatus.WaitingPayment.
			if (currentTransactionStatus !== TransactionApprovalStatus.WaitingPayment)
				throw new ErrorBadRequest(
					'You cannot cancel transaction that already payed'
				)

			// Update transaction
			const updatedTransaction = await prisma.transaction.update({
				where: { id: transactionId },
				data: {
					status: TransactionApprovalStatus.Canceled,
					transactionApprovals: {
						create: {
							status: TransactionApprovalStatus.Canceled,
							statusDescription:
								transactionService.generateTransactionStatusApprovalDescription(
									TransactionApprovalStatus.Canceled
								),
							user: {
								connect: { id: req.currentUser?.id as string }
							}
						}
					}
				}
			})

			const { code, ...restResponse } = SuccessOk({
				result: updatedTransaction
			})
			return res.status(code).json(restResponse)
		}
	}
}
