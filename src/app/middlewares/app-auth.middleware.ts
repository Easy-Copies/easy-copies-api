// Express
import { Request, Response, NextFunction } from 'express'

// JWT
import jwt from 'jsonwebtoken'

// Utils
import { ErrorBadRequest, ErrorForbidden } from '@/app/errors'

// Types
import { TUserJwtPayload } from '@/auth/types/auth.type'

// Prisma
import { PrismaClient } from '@prisma/client'

// Types
import {
	EAppPermission,
	EAppPermissionActions
} from '../types/app-permission.type'

// Init Prisma
const prisma = new PrismaClient()

declare global {
	namespace Express {
		interface Request {
			currentUser?: TUserJwtPayload
		}
	}
}

const appAuthMiddleware =
	(options?: {
		permissionCode?: EAppPermission
		permissionActions?: EAppPermissionActions
	}) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Check for authorization header
			const authorizationHeader = req.headers?.authorization

			if (!authorizationHeader) {
				throw new ErrorBadRequest('Authorization header should be exists')
			}
			const token = authorizationHeader.split(' ')?.[1]
			if ([false, null, 'null'].includes(token)) {
				throw new ErrorBadRequest(
					'Authorization header should have token, or maybe your token is null'
				)
			}

			const user = (await jwt.verify(
				token,
				process.env.JWT_KEY as string
			)) as TUserJwtPayload

			req.currentUser = user

			// Check if user want to check by permission
			if (options?.permissionCode && options?.permissionActions) {
				// Check if user have roles
				const userRoles = await prisma.roleUser.findMany({
					where: { userId: user.id }
				})
				if (userRoles.length === 0)
					throw new ErrorForbidden('User did not have any roles')

				// Check if user have active role
				const userActiveRole = await prisma.roleUser.findFirst({
					where: { userId: user.id, isActive: true }
				})
				if (!userActiveRole)
					throw new ErrorForbidden('User did not have active role')

				// Get permissions of active role
				const activeRolePermissions = await prisma.permissionRole.findMany({
					where: { roleId: userActiveRole.roleId }
				})
				if (activeRolePermissions.length === 0)
					throw new ErrorForbidden('Role did not have any permissions')

				// Check role have permissions by desired permission code
				const rolePermission = await prisma.permissionRole.findFirst({
					where: {
						roleId: userActiveRole.roleId,
						permissionCode: options.permissionCode
					}
				})
				if (!rolePermission) throw new ErrorForbidden('Permission not found')
				if (rolePermission) {
					const actions = rolePermission.actions as {
						create: boolean
						read: boolean
						update: boolean
						delete: boolean
					}

					// Check if user can't create
					if (
						!actions.create &&
						options?.permissionActions === EAppPermissionActions.CREATE
					)
						throw new ErrorForbidden('You do not have permission to create!')

					// Check if user can't read
					if (
						!actions.read &&
						options?.permissionActions === EAppPermissionActions.READ
					)
						throw new ErrorForbidden('You do not have permission to read!')

					// Check if user can't update
					if (
						!actions.update &&
						options?.permissionActions === EAppPermissionActions.UPDATE
					)
						throw new ErrorForbidden('You do not have permission to update!')

					// Check if user can't delete
					if (
						!actions.delete &&
						options?.permissionActions === EAppPermissionActions.DELETE
					)
						throw new ErrorForbidden('You do not have permission to delete!')
				}
			}
		} finally {
			//
		}

		return next()
	}

export { appAuthMiddleware }
