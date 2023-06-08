// Types
import { IStoreControllerV1 } from './store-v1.controller.type'

// Express
import { Request, Response } from 'express'

// Responses
import { SuccessCreated, SuccessOk } from '@/app/success/success'

// Prisma
import { Prisma, PrismaClient, StoreApprovalStatus } from '@prisma/client'
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'

// Express Validator
import { ValidationChain, body } from 'express-validator'

// Errors
import {
	ErrorBadRequest,
	ErrorForbidden,
	ErrorNotFound,
	ErrorValidation
} from '@/app/errors'

// Services
const appCommonService = new AppCommonService()

// Init Prisma
const prisma = new PrismaClient()

export class StoreControllerV1 implements IStoreControllerV1 {
	/**
	 * @description Validation input
	 *
	 * @param {boolean} isCreate
	 *
	 * @return {}
	 *
	 */
	private _createOrUpdateValidation = (
		// eslint-disable-next-line
		isCreate?: boolean
	): ValidationChain[] => {
		return [
			body('name')
				.isLength({ min: 1, max: 60 })
				.withMessage('Name of store is required and maximum 60 characters'),
			body('description')
				.isLength({ max: 100 })
				.not()
				.isEmpty()
				.withMessage(
					'Description of store is required and maximum 100 characters'
				),
			body('phoneNumber')
				.isLength({ min: 8, max: 14 })
				.withMessage(
					'Phone Number of store is required and minimum 8 to 14 characters'
				),
			body('address')
				.isLength({ min: 1, max: 225 })
				.withMessage('Address of store is required and maximum 225 characters'),
			body('addressNote')
				.isLength({ max: 60 })
				.withMessage('Address Note of store has maximum of 60 characters'),
			body('provinceCode')
				.not()
				.isEmpty()
				.withMessage('Province of store is required'),
			body('regencyCode')
				.not()
				.isEmpty()
				.withMessage('Regency of store is required'),
			body('districtCode')
				.not()
				.isEmpty()
				.withMessage('District of store is required'),
			body('postalCode')
				.isLength({ min: 4, max: 5 })
				.withMessage('Postal Code is required and minimum 4 to 5 characters'),
			body('storePhoto').not().isEmpty().withMessage('Store Photo is required'),
			body('nik')
				.isLength({ min: 16, max: 16 })
				.withMessage('NIK is required and maximum 16 characters'),
			body('ktpPhoto').not().isEmpty().withMessage('Store Photo is required'),
			body('isOpen').not().isEmpty().withMessage('Is Open of store is required')
		]
	}

	/**
	 * @description Common include for store model
	 *
	 * @param {object} options
	 *
	 * @return {Prisma}
	 */
	private _commonStoreInclude = (options?: {
		index?: boolean
		show?: boolean
	}): Prisma.StoreInclude => {
		return {
			province: true,
			district: true,
			regency: true,
			user: {
				select: {
					name: true
				}
			},
			storeApprovals: {
				...(options?.index
					? {
							take: 1,
							orderBy: {
								createdAt: 'desc'
							}
					  }
					: options?.show
					? {
							orderBy: {
								createdAt: 'asc'
							},
							include: {
								user: {
									select: {
										id: true,
										name: true,
										roles: {
											where: { isActive: true },
											select: {
												role: {
													select: {
														id: true,
														name: true
													}
												}
											}
										}
									}
								}
							}
					  }
					: undefined)
			}
		}
	}

	/**
	 * @description Get current status store approval
	 *
	 * @param {string} storeId
	 *
	 * @return {Promise<string>} Promise<string>
	 */
	private _getCurrentStatusStoreApproval = async (
		storeId: string
	): Promise<StoreApprovalStatus> => {
		const store = await prisma.store.findFirst({
			where: { id: storeId },
			include: {
				storeApprovals: {
					take: 1,
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		})

		return store?.storeApprovals?.[0]?.status as StoreApprovalStatus
	}

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

			// Checking if user is admin
			const isAdmin = await appCommonService.isAuthenticatedUserAdmin(
				req.currentUser?.id as string
			)

			const storeList = await prisma.store.findMany({
				...appCommonService.paginateArgs(req.query),
				include: {
					...this._commonStoreInclude({ index: true })
				},
				where: {
					userId: isAdmin ? undefined : (req.currentUser?.id as string),
					storeApprovals: {
						every: { status: _storeStatus }
					}
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
		validateInput: [...this._createOrUpdateValidation()],
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
					storeApprovals: {
						create: {
							status: StoreApprovalStatus.Pending,
							statusDescription:
								appCommonService.generateStoreStatusApprovalDescription(
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

			// Checking if user is admin
			const isAdmin = await appCommonService.isAuthenticatedUserAdmin(
				req.currentUser?.id as string
			)

			// Get single store
			const store = await prisma.store.findFirst({
				include: {
					...this._commonStoreInclude({ show: true })
				},
				where: {
					userId: isAdmin ? undefined : (req.currentUser?.id as string),
					id
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
		validateInput: [...this._createOrUpdateValidation()],
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
			const currentStoreStatus = await this._getCurrentStatusStoreApproval(
				storeDetail.id
			)
			if (
				![
					StoreApprovalStatus.Revise,
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
					storeApprovals:
						nextApprovalStatus === StoreApprovalStatus.Revised
							? {
									create: {
										reviseComment,
										status: nextApprovalStatus,
										statusDescription:
											appCommonService.generateStoreStatusApprovalDescription(
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
			const currentStoreStatus = await this._getCurrentStatusStoreApproval(id)

			// Restrict if store not inside Pending, Reject, or Cancel.
			if (
				![
					StoreApprovalStatus.Cancel,
					StoreApprovalStatus.Pending,
					StoreApprovalStatus.Rejected
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

	/**
	 * @description Cancel store
	 *
	 *
	 */
	cancelStore = {
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
			const currentStoreStatus = await this._getCurrentStatusStoreApproval(id)
			if (currentStoreStatus === StoreApprovalStatus.Cancel)
				throw new ErrorBadRequest('Store already been canceled')

			// Update store
			const updatedStore = await prisma.store.update({
				where: { id },
				data: {
					storeApprovals: {
						create: {
							status: StoreApprovalStatus.Cancel,
							statusDescription:
								appCommonService.generateStoreStatusApprovalDescription(
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
