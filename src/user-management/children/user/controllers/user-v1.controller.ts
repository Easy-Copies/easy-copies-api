// Types
import { IUserControllerV1 } from './user-v1.controller.type'
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

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
import { Prisma, PrismaClient } from '@prisma/client'
import type { User } from '@prisma/client'

// Lodash
import omit from 'lodash.omit'
import uniq from 'lodash.uniq'

// Init Prisma
const prisma = new PrismaClient()

// Services
const appCommonService = new AppCommonService()

export class UserControllerV1 implements IUserControllerV1 {
	/**
	 * @description Map user
	 *
	 *
	 */
	_mapUser = (user: User) => {
		return omit(user, ['password'])
	}

	/**
	 * @description Get user with roles
	 *
	 * @param {string} id
	 *
	 */
	_getUserWithRoles = (id?: string) => {
		const userInclude: Prisma.UserInclude = {
			roles: {
				orderBy: { createdAt: 'desc' },
				select: {
					role: {
						select: {
							name: true
						}
					},
					isActive: true,
					createdAt: true,
					updatedAt: true
				}
			}
		}

		const query = prisma.user.findFirst({
			where: {
				id
			},
			include: userInclude
		})

		return { query, userInclude }
	}

	/**
	 * @description Get list of users
	 *
	 */
	index = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.USER_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			const userList = await prisma.user.findMany(
				appCommonService.paginateArgs(req.query)
			)
			const userListPaginated = appCommonService.paginate(
				{ result: userList, total: await prisma.role.count() },
				req.query
			)

			const { code, ...restResponse } = SuccessOk({
				result: userListPaginated
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Store user
	 *
	 */
	store = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required'),
			body('email').isEmail().withMessage('Must be valid email'),
			body('password')
				.isLength({ min: 8 })
				.withMessage('Password minimal length must 8'),
			body('roles')
				.isArray()
				.withMessage('Roles must be an array')
				.custom(roles => {
					if (roles?.every((role: string) => typeof role === 'number'))
						throw new Error('Role must be an string of ID')

					return true
				})
		],
		permission: {
			permissionCode: EAppPermission.USER_MANAGEMENT,
			permissionActions: EAppPermissionActions.CREATE
		},
		config: async (req: Request, res: Response) => {
			const { name, password, roles } = req.body
			let { email } = req.body

			// Map Email
			email = email.replace(/\s+/, '').trim().toLowerCase()

			// Check if user in database exists
			const user = await prisma.user.findFirst({
				where: {
					email: { contains: email, mode: 'insensitive' }
				}
			})
			if (user) throw new ErrorBadRequest(`Email ${email} already exists`)

			// Hash Password
			const hashedPassword = await appCommonService.hashPassword(password)

			// Create new user
			const createdUser = await prisma.user.create({
				data: {
					name: name.trim(),
					email,
					password: hashedPassword,
					roles: {
						create: roles.map((roleId: number) => ({
							role: { connect: { id: roleId } }
						}))
					}
				},
				include: this._getUserWithRoles().userInclude
			})

			const { code, ...restResponse } = SuccessCreated({
				result: this._mapUser(createdUser)
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get single user
	 *
	 */
	show = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.USER_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			const { id } = req.params

			// Check if user in database exists
			const user = await this._getUserWithRoles(id).query
			if (!user) throw new ErrorNotFound('User not found')

			const { code, ...restResponse } = SuccessOk({
				result: omit(user, ['password'])
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Update single user
	 *
	 *
	 */
	update = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required'),
			body('email').isEmail().withMessage('Must be valid email'),
			body('roles')
				.isArray()
				.withMessage('Roles must be an array')
				.custom(roles => {
					if (roles?.every((role: string) => typeof role === 'number'))
						throw new Error('Role must be an string of ID')

					return true
				})
		],
		permission: {
			permissionCode: EAppPermission.USER_MANAGEMENT,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			const { id } = req.params
			const { name, roles } = req.body
			let { email } = req.body
			const transactions = []

			// Map Email
			email = email.replace(/\s+/, '').trim().toLowerCase()

			// Check if user exists
			const currentUser = await this._getUserWithRoles(id).query
			if (!currentUser) throw new ErrorNotFound('User not found')

			// Check if user in database exists
			// But ignore the selected one
			const user = await prisma.user.findFirst({
				where: {
					NOT: { id },
					email: { contains: email, mode: 'insensitive' }
				}
			})
			if (user)
				throw new ErrorBadRequest(
					`User with email '${user.email}' already exists`
				)

			// Get attached roles
			const attachedUserRoles = await prisma.user.findFirst({
				where: { id },
				include: { roles: { where: { roleId: { in: roles } } } }
			})

			// Get unattached user roles
			const unattachedUserRoles = await prisma.user.findFirst({
				where: { id },
				include: { roles: { where: { NOT: { roleId: { in: roles } } } } }
			})

			// Remove unattached roles
			if (unattachedUserRoles?.roles && unattachedUserRoles.roles?.length > 0) {
				const removeUnattachedUserRoles = prisma.user.update({
					where: { id },
					data: {
						roles: {
							delete: unattachedUserRoles.roles.map(role => ({
								userId_roleId: { roleId: role.roleId, userId: id }
							}))
						}
					},
					select: { roles: true }
				})

				transactions.push(removeUnattachedUserRoles)
			}

			// Update selected user by removing unattached roles
			const newOrExistingRoleIds = uniq([
				...roles,
				...(attachedUserRoles?.roles?.map(role => role.roleId) || [])
			])
			const updateUserWithRoles = prisma.user.update({
				where: { id },
				include: { roles: true },
				data: {
					name: name.trim(),
					email,
					roles: {
						upsert: newOrExistingRoleIds.map(roleId => ({
							where: { userId_roleId: { roleId, userId: id } },
							create: { role: { connect: { id: roleId } } },
							update: { roleId }
						}))
					}
				}
			})
			transactions.push(updateUserWithRoles)

			// Transact
			await prisma.$transaction(transactions)

			// Re-fetch user
			const updatedUser = await this._getUserWithRoles(id).query

			const { code, ...restResponse } = SuccessOk({
				result: omit(updatedUser, ['password'])
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Destroy single user
	 *
	 */
	destroy = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required'),
			body('email').isEmail().withMessage('Must be valid email'),
			body('roles')
				.isArray()
				.withMessage('Roles must be an array')
				.custom(roles => {
					if (roles?.every((role: string) => typeof role === 'number'))
						throw new Error('Role must be an string of ID')

					return true
				})
		],
		permission: {
			permissionCode: EAppPermission.USER_MANAGEMENT,
			permissionActions: EAppPermissionActions.UPDATE
		},
		config: async (req: Request, res: Response) => {
			const { id } = req.params

			// Check if user in database exists
			const user = await this._getUserWithRoles(id).query
			if (!user) throw new ErrorNotFound('User not found')

			// Delete user
			await prisma.user.delete({ where: { id: user.id } })

			const { code, ...restResponse } = SuccessOk({
				result: this._mapUser(user)
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get role list
	 *
	 *
	 */
	roleList = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.USER_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			const roles = await prisma.role.findMany({
				select: { id: true, name: true },
				orderBy: { name: 'asc' }
			})

			const { code, ...restResponse } = SuccessOk({
				result: roles
			})
			return res.status(code).json(restResponse)
		}
	}
}
