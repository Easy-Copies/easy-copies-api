// Types
import { IStoreServiceControllerV1 } from './store-service-v1.controller.type'

// Express
import { Request, Response } from 'express'

// Responses
import { SuccessOk, SuccessCreated } from '@/app/success/success'

// Prisma
import { PrismaClient } from '@prisma/client'
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'

// Services
const appCommonService = new AppCommonService()

// Init Prisma
const prisma = new PrismaClient()

export class StoreServiceController implements IStoreServiceControllerV1 {
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
			const storeService = await prisma.storeService.findMany(
				appCommonService.paginateArgs(req.query)
			)
			const roleListPaginated = appCommonService.paginate(
				{ result: storeService, total: await prisma.role.count() },
				req.query
			)

			const { code, ...restResponse } = SuccessOk({
				result: roleListPaginated
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Add service to store
	 *
	 *
	 */
	store = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_SERVICE,
			permissionActions: EAppPermissionActions.CREATE
		},
		config: async (req: Request, res: Response) => {
			const { code, ...restResponse } = SuccessCreated()
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get detail of store
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
			const { code, ...restResponse } = SuccessOk()
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get detail of store
	 *
	 *
	 */
	update = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.STORE_MANAGEMENT_SERVICE,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			const { code, ...restResponse } = SuccessOk()
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Delete detail of store
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
			const { code, ...restResponse } = SuccessOk()
			return res.status(code).json(restResponse)
		}
	}
}
