// Types
import { IRoleControllerV1 } from './role-v1.controller.type'

// Services
import { RoleV1Service } from '@/user-management/children/role/services/role-v1.service'
import { AppCommonService } from '@/app/services/app-common.service'

// Express
import { Request, Response } from 'express'

// Express Validator
import { body } from 'express-validator'

// Responses
import { SuccessOk, SuccessCreated } from '@/app/success/success'

// Errors
import { ErrorBadRequest, ErrorNotFound } from '@/app/errors'

// Prisma
import { PrismaClient } from '@prisma/client'
import type { Role } from '@prisma/client'

// Init Prisma
const prisma = new PrismaClient()

// Services
const appCommonService = new AppCommonService()
const roleV1Service = new RoleV1Service(prisma)

export class RoleControllerV1 implements IRoleControllerV1 {
	/**
	 * @description Get list of roles
	 *
	 */
	index = async (req: Request, res: Response) => {
		const result = await appCommonService.paginate<Role>(
			roleV1Service.model,
			appCommonService.parsePaginationArgs(req.query)
		)

		const { code, ...restResponse } = SuccessOk({
			result
		})
		return res.status(code).json(restResponse)
	}

	/**
	 * @description Store role
	 *
	 */
	store = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required')
		],
		config: async (req: Request, res: Response) => {
			const { name } = req.body

			// Check if role in database exists
			const role = await roleV1Service.show({
				where: { name: { contains: name.trim(), mode: 'insensitive' } }
			})
			if (role)
				throw new ErrorBadRequest(
					`Role with name '${role.name}' already exists`
				)

			// Create new role
			const newRole = await roleV1Service.store({ data: { name: name.trim() } })

			const { code, ...restResponse } = SuccessCreated({
				result: newRole
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get single role
	 *
	 */
	show = async (req: Request, res: Response) => {
		const { id } = req.params

		// Check if role in database exists
		const role = await roleV1Service.show({
			where: { id }
		})
		if (!role) throw new ErrorNotFound('Role not found')

		const { code, ...restResponse } = SuccessCreated({
			result: role
		})
		return res.status(code).json(restResponse)
	}

	/**
	 * @description Update single role
	 *
	 * @param {Prisma.RoleUpdateArgs} args
	 *
	 */
	update = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required')
		],
		config: async (req: Request, res: Response) => {
			const { id } = req.params
			const { name } = req.body

			// Check if role in database exists
			const role = await roleV1Service.show({
				where: {
					NOT: { id },
					name: { contains: name.trim(), mode: 'insensitive' }
				}
			})
			if (role)
				throw new ErrorBadRequest(
					`Role with name '${role.name}' already exists`
				)

			// Update selected role
			const newRole = await roleV1Service.update({
				data: { name: name.trim() },
				where: { id }
			})

			const { code, ...restResponse } = SuccessOk({
				result: newRole
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Destroy single role
	 *
	 */
	destroy = async (req: Request, res: Response) => {
		const { id } = req.params

		// Check if role in database exists
		const role = await roleV1Service.show({
			where: { id }
		})
		if (!role) throw new ErrorNotFound('Role not found')

		// Delete role
		await roleV1Service.destroy({ where: { id: role.id } })

		const { code, ...restResponse } = SuccessOk({
			result: role
		})
		return res.status(code).json(restResponse)
	}
}
