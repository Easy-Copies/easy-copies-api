// Types
import { IStoreServiceControllerV1 } from './store-service-v1.controller.type'

// Express
import { Request, Response } from 'express'

// Responses
import { SuccessOk, SuccessCreated } from '@/app/success/success'

// Prisma
import {
	PrismaClient,
	StoreApprovalStatus,
	StoreServiceName
} from '@prisma/client'
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'

// Express Validator
import { body } from 'express-validator'

// Errors
import { ErrorBadRequest, ErrorForbidden, ErrorNotFound } from '@/app/errors'

// Services
const appCommonService = new AppCommonService()

// Init Prisma
const prisma = new PrismaClient()

export class StoreServiceControllerV1 implements IStoreServiceControllerV1 {
	/**
	 * @description Get list of store services
	 *
	 *
	 */
	index = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_SERVICE,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { storeId } = req.params

			const storeService = await prisma.storeService.findMany({
				...appCommonService.paginateArgs(req.query),
				where: {
					storeId,
					store: {
						status: StoreApprovalStatus.Approved
					}
				}
			})
			const storeServiceListPaginated = appCommonService.paginate(
				{ result: storeService, total: await prisma.storeService.count() },
				req.query
			)

			const { code, ...restResponse } = SuccessOk({
				result: storeServiceListPaginated
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Add store service
	 *
	 *
	 */
	store = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required'),
			body('price')
				.not()
				.isEmpty()
				.isNumeric()
				.withMessage('Price should be numeric'),
			body('pricePerSheet')
				.not()
				.isEmpty()
				.isNumeric()
				.withMessage('Price Per Sheet should be numeric')
		],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_SERVICE,
			permissionActions: EAppPermissionActions.CREATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { storeId } = req.params
			const { name, price, pricePerSheet } = req.body

			// Get store detail
			const storeDetail = await prisma.store.findFirst({
				where: { id: storeId, status: StoreApprovalStatus.Approved }
			})
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Check if store doesn't belong to some user
			if (storeDetail.userId !== (req.currentUser?.id as string))
				throw new ErrorForbidden('You cannot do this action')

			// Check if name is equal to enum StoreServiceName
			if (!Object.values(StoreServiceName).includes(name))
				throw new ErrorBadRequest('Name should be using StoreServiceName')

			// Get store services
			const storeService = await prisma.storeService.findFirst({
				where: { storeId, name }
			})

			// Check if theres any service registered
			if (storeService)
				throw new ErrorBadRequest(
					`Service ${name} already registered in your store`
				)

			// Create new service for the store
			const createdStoreService = await prisma.storeService.create({
				data: {
					name,
					price,
					pricePerSheet,
					storeId
				}
			})

			const { code, ...restResponse } = SuccessCreated({
				result: createdStoreService
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get detail of store service
	 *
	 *
	 */
	show = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_SERVICE,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { serviceId } = req.params

			// Get detail of store service
			const serviceDetail = await prisma.storeService.findFirst({
				where: { id: serviceId }
			})
			if (!serviceDetail) throw new ErrorNotFound('Store Service not found')

			const { code, ...restResponse } = SuccessOk({
				result: serviceDetail
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get detail of store service
	 *
	 *
	 */
	update = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required'),
			body('price')
				.not()
				.isEmpty()
				.isNumeric()
				.withMessage('Price should be numeric'),
			body('pricePerSheet')
				.not()
				.isEmpty()
				.isNumeric()
				.withMessage('Price should be numeric')
		],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_SERVICE,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { serviceId } = req.params
			const { name, price, pricePerSheet } = req.body

			// Get detail of store service
			const serviceDetail = await prisma.storeService.findFirst({
				where: { id: serviceId }
			})
			if (!serviceDetail) throw new ErrorNotFound('Store Service not found')

			// Get store detail
			const storeDetail = await prisma.store.findFirst({
				where: {
					id: serviceDetail.storeId,
					status: StoreApprovalStatus.Approved
				}
			})
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Check if store doesn't belong to some user
			if (storeDetail.userId !== (req.currentUser?.id as string))
				throw new ErrorForbidden('You cannot do this action')

			// Check if name is equal to enum StoreServiceName
			if (!Object.values(StoreServiceName).includes(name))
				throw new ErrorBadRequest('Name should be using StoreServiceName')

			// Get store services
			const storeService = await prisma.storeService.findFirst({
				where: { NOT: { id: serviceDetail.id }, storeId: storeDetail.id, name }
			})

			// Check if theres any service registered
			if (storeService)
				throw new ErrorBadRequest(
					`Service ${name} already registered in your store`
				)

			// Update service for the store
			const updatedStoreService = await prisma.storeService.update({
				where: { id: serviceDetail.id },
				data: {
					name,
					price,
					pricePerSheet,
					storeId: storeDetail.id
				}
			})

			const { code, ...restResponse } = SuccessOk({
				result: updatedStoreService
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Delete store service
	 *
	 *
	 */
	destroy = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_SERVICE,
			permissionActions: EAppPermissionActions.DELETE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { serviceId } = req.params

			// Get detail of store service
			const serviceDetail = await prisma.storeService.findFirst({
				where: { id: serviceId }
			})
			if (!serviceDetail) throw new ErrorNotFound('Store Service not found')

			// Get store detail
			const storeDetail = await prisma.store.findFirst({
				where: {
					id: serviceDetail.storeId,
					status: StoreApprovalStatus.Approved
				}
			})
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Check if store doesn't belong to some user
			if (storeDetail.userId !== (req.currentUser?.id as string))
				throw new ErrorForbidden('You cannot do this action')

			// Delete selected service
			const deletedService = await prisma.storeService.delete({
				where: { id: serviceDetail.id }
			})

			const { code, ...restResponse } = SuccessOk({
				result: deletedService
			})
			return res.status(code).json(restResponse)
		}
	}
}
