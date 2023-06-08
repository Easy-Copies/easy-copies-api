// Types
import { IStoreControllerV1 } from './store-v1.controller.type'

// Express
import { Request, Response } from 'express'

// Responses
import { SuccessCreated, SuccessOk } from '@/app/success/success'

// Prisma
import { PrismaClient, StoreApprovalStatus } from '@prisma/client'
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'
import { StoreService } from '@/store/services/store.service'

// Errors
import {
	ErrorBadRequest,
	ErrorForbidden,
	ErrorNotFound,
	ErrorValidation
} from '@/app/errors'

// Services
const appCommonService = new AppCommonService()
const storeService = new StoreService()

// Init Prisma
const prisma = new PrismaClient()

export class StoreControllerV1 implements IStoreControllerV1 {
	/**
	 * @description Get list of stores
	 *
	 *
	 */
	index = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { status } = req.query
			let _storeStatus: StoreApprovalStatus

			// Set default status
			if (!status) _storeStatus = StoreApprovalStatus.Approved
			else _storeStatus = status as StoreApprovalStatus

			// Check if user have authorization to approve
			const isUserHaveApprovalAuthorization =
				await storeService.isUserHaveApprovalAuthorization(
					req.currentUser?.id as string
				)

			const storeList = await prisma.store.findMany({
				...appCommonService.paginateArgs(req.query),
				include: {
					...storeService.commonStoreInclude()
				},
				where: {
					userId: isUserHaveApprovalAuthorization
						? undefined
						: (req.currentUser?.id as string),
					status: { equals: _storeStatus }
				}
			})
			const storeListPaginated = appCommonService.paginate(
				{ result: storeList, total: await prisma.store.count() },
				req.query
			)

			const { code, ...restResponse } = SuccessOk({
				result: storeListPaginated
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Create new store
	 *
	 *
	 */
	store = {
		validateInput: [...storeService.createOrUpdateValidation()],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT,
			permissionActions: EAppPermissionActions.CREATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const {
				name,
				description,
				phoneNumber,
				address,
				addressNote,
				provinceCode,
				regencyCode,
				districtCode,
				postalCode,
				mapCoordinate,
				storeLogo,
				storePhoto,
				nik,
				ktpPhoto,
				npwp,
				npwpPhoto,
				isOpen
			} = req.body

			// Create new store
			const createdStore = await prisma.store.create({
				data: {
					name,
					description,
					phoneNumber,
					address,
					addressNote,
					provinceCode,
					regencyCode,
					districtCode,
					postalCode,
					mapCoordinate,
					storeLogo,
					storePhoto,
					nik,
					ktpPhoto,
					npwp,
					npwpPhoto,
					isOpen,
					userId: req.currentUser?.id as string,
					email: req.currentUser?.email as string,
					status: StoreApprovalStatus.Pending,
					storeApprovals: {
						create: {
							status: StoreApprovalStatus.Pending,
							statusDescription:
								storeService.generateStoreStatusApprovalDescription(
									StoreApprovalStatus.Pending
								),
							user: {
								connect: {
									id: req.currentUser?.id as string
								}
							}
						}
					}
				}
			})

			const { code, ...restResponse } = SuccessCreated({
				message: 'Store successfully created and waiting Admin for approval',
				result: createdStore
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get store detail
	 *
	 *
	 */
	show = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { id } = req.params

			// Get single store
			const store = await prisma.store.findFirst({
				where: { id },
				include: {
					...storeService.commonStoreInclude(),
					storeApprovals: {
						select: {
							id: true,
							reviseComment: true,
							rejectReason: true,
							status: true,
							user: {
								select: {
									id: true,
									name: true
								}
							},
							createdAt: true
						}
					}
				}
			})

			// Check if store not exists
			if (!store) throw new ErrorNotFound('Store not found')

			const { code, ...restResponse } = SuccessOk({
				result: store
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Update store
	 *
	 *
	 */
	update = {
		validateInput: [...storeService.createOrUpdateValidation()],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { id } = req.params
			const {
				name,
				description,
				phoneNumber,
				address,
				addressNote,
				provinceCode,
				regencyCode,
				districtCode,
				postalCode,
				mapCoordinate,
				storeLogo,
				storePhoto,
				nik,
				ktpPhoto,
				npwp,
				npwpPhoto,
				isOpen,
				reviseComment
			} = req.body

			// Get detail of store
			const storeDetail = await prisma.store.findFirst({ where: { id } })

			// Check if store exists
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Check for permission for editing
			if (storeDetail.userId !== (req.currentUser?.id as string))
				throw new ErrorForbidden('You cannot perform this action')

			// Restrict update if user inside specific status
			const currentStoreStatus =
				await storeService.getCurrentStatusStoreApproval(storeDetail.id)
			if (
				![
					StoreApprovalStatus.Revise,
					StoreApprovalStatus.Rejected,
					StoreApprovalStatus.Pending,
					StoreApprovalStatus.Approved
				]
					.map(status => status.toString())
					.includes(currentStoreStatus)
			)
				throw new ErrorBadRequest(
					'You cannot edit this store, because store is not inside Revise, Approved, or Pending status'
				)

			// Check if current status of store is revise
			// And user not include the revise comment
			if (currentStoreStatus === StoreApprovalStatus.Revise && !reviseComment)
				throw new ErrorValidation([
					{ msg: 'Revise Comment is required', param: 'reviseComment' }
				])

			// Generate next status of approval
			let nextApprovalStatus: StoreApprovalStatus
			let responseMessage = 'Store successfully updated'
			switch (currentStoreStatus) {
				case StoreApprovalStatus.Revise:
					responseMessage = `${responseMessage}, and successfully revised. Please wait for admin response your revised store`
					nextApprovalStatus = StoreApprovalStatus.Revised
					break
				default:
					nextApprovalStatus = currentStoreStatus
			}

			const updatedStore = await prisma.store.update({
				where: { id },
				data: {
					name,
					description,
					phoneNumber,
					address,
					addressNote,
					provinceCode,
					regencyCode,
					districtCode,
					postalCode,
					mapCoordinate,
					storeLogo,
					storePhoto,
					nik,
					ktpPhoto,
					npwp,
					npwpPhoto,
					isOpen,
					status:
						nextApprovalStatus === StoreApprovalStatus.Revised
							? StoreApprovalStatus.Revised
							: storeDetail.status,
					storeApprovals:
						nextApprovalStatus === StoreApprovalStatus.Revised
							? {
									create: {
										reviseComment,
										status: nextApprovalStatus,
										statusDescription:
											storeService.generateStoreStatusApprovalDescription(
												nextApprovalStatus
											),
										user: {
											connect: {
												id: req.currentUser?.id as string
											}
										}
									}
							  }
							: undefined
				}
			})

			const { code, ...restResponse } = SuccessOk({
				message: responseMessage,
				result: updatedStore
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Delete store
	 *
	 *
	 */
	destroy = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT,
			permissionActions: EAppPermissionActions.DELETE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { id } = req.params

			// Get detail of store
			const storeDetail = await prisma.store.findFirst({ where: { id } })

			// Check if store exists
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Check for permission for editing
			if (storeDetail.userId !== (req.currentUser?.id as string))
				throw new ErrorForbidden('You cannot perform this action')

			// Get current status of store
			const currentStoreStatus =
				await storeService.getCurrentStatusStoreApproval(id)

			// Restrict if store not inside Pending, Reject, or Cancel.
			if (
				![
					StoreApprovalStatus.Pending,
					StoreApprovalStatus.Rejected,
					StoreApprovalStatus.Cancel
				]
					.map(store => store.toString())
					.includes(currentStoreStatus)
			)
				throw new ErrorBadRequest(
					'You cannot delete this store, because store is not on Pending, Reject, or Cancel status'
				)

			// Delete store
			const deletedStore = await prisma.store.delete({ where: { id } })

			const { code, ...restResponse } = SuccessOk({
				result: deletedStore
			})
			return res.status(code).json(restResponse)
		}
	}
}
