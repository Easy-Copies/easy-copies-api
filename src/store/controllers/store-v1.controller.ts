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

// Express Validator
import { ValidationChain, body } from 'express-validator'

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
	// eslint-disable-next-line
	createOrUpdateValidation = (isCreate?: boolean): ValidationChain[] => {
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
					province: true,
					district: true,
					regency: true,
					user: {
						select: {
							name: true
						}
					},
					storeApprovals: {
						take: 1,
						orderBy: {
							createdAt: 'desc'
						}
					}
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
		validateInput: [...this.createOrUpdateValidation()],
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
			const { code, ...restResponse } = SuccessOk()
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Update store
	 *
	 *
	 */
	update = {
		validateInput: [...this.createOrUpdateValidation()],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			const { code, ...restResponse } = SuccessOk()
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
			const { code, ...restResponse } = SuccessOk()
			return res.status(code).json(restResponse)
		}
	}
}
