// Types
import { IRoleControllerV1 } from './role-v1.controller.type'

// Services
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

// Types
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

// Init Prisma
const prisma = new PrismaClient()

// Services
const appCommonService = new AppCommonService()

export class RoleControllerV1 implements IRoleControllerV1 {
	/**
	 * @description Get list of roles
	 *
	 */
	index = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.ROLE_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			const roleList = await prisma.role.findMany(
				appCommonService.paginateArgs(req.query)
			)
			const roleListPaginated = appCommonService.paginate(
				{ result: roleList, total: await prisma.role.count() },
				req.query
			)

			const { code, ...restResponse } = SuccessOk({
				result: roleListPaginated
			})
			return res.status(code).json(restResponse)
		}
	}
	/**
	 * @description Store role
	 *
	 */
	store = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required')
		],
		permission: {
			permissionCode: EAppPermission.ROLE_MANAGEMENT,
			permissionActions: EAppPermissionActions.CREATE
		},
		config: async (req: Request, res: Response) => {
			const { name } = req.body

			// Check if role in database exists
			const role = await prisma.role.findFirst({
				where: { name: { contains: name.trim(), mode: 'insensitive' } }
			})
			if (role)
				throw new ErrorBadRequest(
					`Role with name '${role.name}' already exists`
				)

			// Create new role
			const newRole = await prisma.role.create({ data: { name: name.trim() } })

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
	show = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.ROLE_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			const { id } = req.params

			// Check if role in database exists
			const role = await prisma.role.findFirst({
				where: { id }
			})
			if (!role) throw new ErrorNotFound('Role not found')

			const { code, ...restResponse } = SuccessOk({
				result: role
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Update single role
	 *
	 *
	 */
	update = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required')
		],
		permission: {
			permissionCode: EAppPermission.ROLE_MANAGEMENT,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			const { id } = req.params
			const { name } = req.body

			// Check if role in database exists
			const role = await prisma.role.findFirst({
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
			const newRole = await prisma.role.update({
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
	destroy = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.ROLE_MANAGEMENT,
			permissionActions: EAppPermissionActions.DELETE
		},
		config: async (req: Request, res: Response) => {
			const { id } = req.params

			// Check if role in database exists
			const role = await prisma.role.findFirst({
				where: { id }
			})
			if (!role) throw new ErrorNotFound('Role not found')

			// Delete role
			await prisma.role.delete({ where: { id: role.id } })

			const { code, ...restResponse } = SuccessOk({
				result: role
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Permission list
	 *
	 */
	permissionList = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.ROLE_MANAGEMENT,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			const { roleId } = req.params

			// Check for role
			const roleDetail = await prisma.role.findFirst({ where: { id: roleId } })
			if (!roleDetail) throw new ErrorNotFound('Role not found')

			// Get all permissions
			const permissions = await prisma.permission.findMany({
				orderBy: { code: 'asc' }
			})

			// Get permission action by specific role
			const permissionActions = await prisma.permissionRole.findMany({
				where: { roleId }
			})

			// Map permission according permission action by specific role
			const mapPermissions = permissions.map(permission => ({
				...permission,
				actions: permissionActions.find(
					permissionAction =>
						permissionAction.permissionCode === permission.code
				)?.actions || {
					create: false,
					read: false,
					update: false,
					delete: false
				}
			}))

			const { code, ...restResponse } = SuccessOk({
				result: mapPermissions
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Assign permission to specific role
	 *
	 */
	assignPermission = {
		validateInput: [
			body('permissionCode')
				.not()
				.isEmpty()
				.withMessage('Permission Code is required'),
			body('actions')
				.not()
				.isEmpty()
				.withMessage('Actions is required')
				.custom(actions => {
					if (typeof actions?.create !== 'boolean')
						throw new Error('actions.create should be boolean')
					if (typeof actions?.read !== 'boolean')
						throw new Error('actions.read should be boolean')
					if (typeof actions?.update !== 'boolean')
						throw new Error('actions.update should be boolean')
					if (typeof actions?.delete !== 'boolean')
						throw new Error('actions.delete should be boolean')

					return true
				})
		],
		permission: {
			permissionCode: EAppPermission.ROLE_MANAGEMENT,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			const { roleId: id } = req.params
			const { permissionCode, actions } = req.body

			// Find role
			const role = await prisma.role.findFirst({ where: { id } })
			if (!role) throw new ErrorNotFound('Role not found')

			// Find permission
			const permission = await prisma.permission.findFirst({
				where: { code: permissionCode }
			})
			if (!permission) throw new ErrorNotFound('Permission not found!')

			// Update permissions
			const updatedRoleWithPermission = await prisma.role.update({
				where: { id },
				data: {
					permissions: {
						upsert: {
							where: { permissionCode_roleId: { permissionCode, roleId: id } },
							update: { actions, permissionCode },
							create: {
								permission: {
									connect: { code: permissionCode }
								},
								actions
							}
						}
					}
				},
				include: {
					permissions: {
						select: {
							permission: {
								select: {
									code: true
								}
							},
							actions: true,
							createdAt: true,
							updatedAt: true
						}
					}
				}
			})

			const { code, ...restResponse } = SuccessOk({
				result: updatedRoleWithPermission
			})
			return res.status(code).json(restResponse)
		}
	}
}
