// Types
import { IPermissionControllerV1 } from './permission-v1.controller.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'

// Express
import { Request, Response } from 'express'

// Responses
import { SuccessOk } from '@/app/success/success'

// Errors
import { ErrorNotFound } from '@/app/errors'

// Prisma
import { PrismaClient } from '@prisma/client'
import type { Permission } from '@prisma/client'

// Init Prisma
const prisma = new PrismaClient()

// Services
const appCommonService = new AppCommonService()

export class PermissionControllerV1 implements IPermissionControllerV1 {
	/**
	 * @description Get list of roles
	 *
	 */
	index = {
		validateInput: [],
		config: async (req: Request, res: Response) => {
			const result = await appCommonService.paginate<Permission>(
				prisma.permission,
				appCommonService.parsePaginationArgs(req.query)
			)

			const { code, ...restResponse } = SuccessOk({
				result
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get single permission
	 *
	 */
	show = {
		validateInput: [],
		config: async (req: Request, res: Response) => {
			const { code: permissionCode } = req.params

			// Check if permission in database exists
			const permission = await prisma.permission.findFirst({
				where: { code: permissionCode },
				include: {
					roles: true
				}
			})
			if (!permission) throw new ErrorNotFound('Permission not found')

			const { code, ...restResponse } = SuccessOk({
				result: permission
			})
			return res.status(code).json(restResponse)
		}
	}
}
