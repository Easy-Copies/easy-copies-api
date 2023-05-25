// Types
import { TUserJwtPayload } from '@/auth/types/auth.type'
import { IAuthControllerV1 } from './auth-v1.controller.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'
import { AppJwtService } from '@/app/services/app-jwt.service'
import { UserV1Service } from '@/user/services/user-v1.service'

// Express
import { Request, Response } from 'express'

// Express Validator
import { body } from 'express-validator'

// Responses
import { SuccessOk, SuccessCreated } from '@/app/success/success'

// Bcrypt
import bcrypt from 'bcryptjs'

// Errors
import { ErrorBadRequest } from '@/app/errors'

// Lodash
import omit from 'lodash.omit'

const userService = new UserV1Service()
const appJwtService = new AppJwtService()

export class AuthControllerV1
	extends AppCommonService
	implements IAuthControllerV1
{
	/**
	 * @description Register a new user
	 *
	 */
	register = {
		validateInput: [
			body('name').not().isEmpty().withMessage('Name is required'),
			body('email').isEmail().withMessage('Email must be valid'),
			body('password')
				.isLength({ min: 8 })
				.withMessage('Password minimal length must 8')
		],
		config: async (req: Request, res: Response) => {
			const { name, email, password } = req.body

			// Check if user exists before
			const existedUser = await userService.show({ where: { email } })
			if (existedUser) throw new ErrorBadRequest('Email currently in used')

			// Hash password
			const salt = await bcrypt.genSalt(10)
			const hashedPassword = await bcrypt.hash(password, salt)

			// Create new user
			const user = await userService.store({
				data: { name, email, password: hashedPassword }
			})

			const { code, ...restResponse } = SuccessCreated({
				result: omit(user, ['password'])
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Log user in
	 *
	 */
	login = {
		validateInput: [
			body('email').isEmail().withMessage('Email must be valid'),
			body('password').not().isEmpty().withMessage('Password is required')
		],
		config: async (req: Request, res: Response) => {
			const { email, password } = req.body

			// Find correct user
			const user = await userService.show({ where: { email } })
			if (!user) throw new ErrorBadRequest('Invalid credentials')

			// Verify user password
			const isPasswordCorrect = await bcrypt.compare(password, user.password)
			if (!isPasswordCorrect) throw new ErrorBadRequest('Invalid credentials')

			// Generate JWT token
			const jwtPayload = { id: user.id, email: user.email }
			const token = appJwtService.generateToken(jwtPayload, false)
			const refreshToken = appJwtService.generateToken(jwtPayload, true)

			// Make user inside req
			req.currentUser = jwtPayload

			const { code, ...restResponse } = SuccessOk({
				result: { token, refreshToken }
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Refresh token
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
	 * @return {any}
	 */
	refreshToken = {
		validateInput: [
			body('refreshToken')
				.not()
				.isEmpty()
				.withMessage('Refresh Token is required')
		],
		config: async (req: Request, res: Response) => {
			const { refreshToken } = req.body

			// Verify the refresh token
			const user = (await appJwtService.verify(
				refreshToken,
				true
			)) as TUserJwtPayload

			// Generate token again
			const jwtPayload = { id: user.id, email: user.email }
			const token = appJwtService.generateToken(jwtPayload, false)
			const newRefreshToken = appJwtService.generateToken(jwtPayload, true)

			const { code, ...restResponse } = SuccessOk({
				result: { token, refreshToken: newRefreshToken }
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Forgot password
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
	 * @return {any}
	 */
	forgotPassword = {
		validateInput: [body('email').isEmail().withMessage('Email must be valid')],
		config: async (req: Request, res: Response) => {
			const { code, ...restResponse } = SuccessOk()
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Forgot password
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
	 * @return {any}
	 */
	me = async (req: Request, res: Response) => {
		// Find current user
		const user = await userService.show({
			where: { id: req.currentUser?.id as string }
		})

		const { code, ...restResponse } = SuccessOk({
			result: omit(user, ['password'])
		})
		return res.status(code).json(restResponse)
	}

	/**
	 * @description Logout an user
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
	 * @return {any}
	 */
	logout = (req: Request, res: Response) => {
		req.currentUser = undefined

		const { code, ...restResponse } = SuccessOk({ message: 'Logout success' })
		return res.status(code).json(restResponse)
	}
}
