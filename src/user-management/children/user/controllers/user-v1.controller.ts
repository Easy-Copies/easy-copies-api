// Types
import { IUserControllerV1 } from './user-v1.controller.type'

// Services
import { UserV1Service } from '@/user-management/children/user/services/user-v1.service'
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
import type { User } from '@prisma/client'

// Lodash
import omit from 'lodash.omit'

// Init Prisma
const prisma = new PrismaClient()

// Services
const appCommonService = new AppCommonService()
const userV1Service = new UserV1Service(prisma)

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
	 * @description Get list of users
	 *
	 */
	index = async (req: Request, res: Response) => {
		const result = await appCommonService.paginate<User>(
			userV1Service.model,
			appCommonService.parsePaginationArgs(req.query)
		)

		const { code, ...restResponse } = SuccessOk({
			result
		})
		return res.status(code).json(restResponse)
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
				.withMessage('Password minimal length must 8')
		],
		config: async (req: Request, res: Response) => {
			const { name, password } = req.body
			let { email } = req.body

			// Map Email
			email = email.replace(/\s+/, '').trim().toLowerCase()

			// Check if user in database exists
			const user = await userV1Service.show({
				where: {
					email: { contains: email, mode: 'insensitive' }
				}
			})
			if (user) throw new ErrorBadRequest(`Email ${email} already exists`)

			// Hash Password
			const hashedPassword = await appCommonService.hashPassword(password)

			// Create new user
			const createdUser = await userV1Service.store({
				data: { name: name.trim(), email, password: hashedPassword }
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
	show = async (req: Request, res: Response) => {
		const { id } = req.params

		// Check if user in database exists
		const user = await userV1Service.show({
			where: { id }
		})
		if (!user) throw new ErrorNotFound('User not found')

		const { code, ...restResponse } = SuccessCreated({
			result: omit(user, ['password'])
		})
		return res.status(code).json(restResponse)
	}

	/**
	 * @description Update single user
	 *
	 * @param {Prisma.UserUpdateArgs} args
	 *
	 */
	update = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required'),
			body('email').isEmail().withMessage('Must be valid email')
		],
		config: async (req: Request, res: Response) => {
			const { id } = req.params
			const { name } = req.body
			let { email } = req.body

			// Map Email
			email = email.replace(/\s+/, '').trim().toLowerCase()

			const currentUser = await userV1Service.show({
				where: {
					id
				}
			})
			if (!currentUser) throw new ErrorNotFound('User not found')

			// Check if user in database exists
			// But ignore the selected one
			const user = await userV1Service.show({
				where: {
					NOT: { id },
					email: { contains: email, mode: 'insensitive' }
				}
			})
			if (user)
				throw new ErrorBadRequest(
					`User with email '${user.email}' already exists`
				)

			// Update selected user
			const updatedUser = await userV1Service.update({
				data: { name: name.trim(), email },
				where: { id }
			})

			const { code, ...restResponse } = SuccessOk({
				result: this._mapUser(updatedUser)
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Destroy single user
	 *
	 */
	destroy = async (req: Request, res: Response) => {
		const { id } = req.params

		// Check if user in database exists
		const user = await userV1Service.show({
			where: { id }
		})
		if (!user) throw new ErrorNotFound('User not found')

		// Delete user
		await userV1Service.destroy({ where: { id: user.id } })

		const { code, ...restResponse } = SuccessOk({
			result: this._mapUser(user)
		})
		return res.status(code).json(restResponse)
	}
}
