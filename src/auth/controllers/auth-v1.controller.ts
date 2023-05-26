// Types
import { TUserJwtPayload } from '@/auth/types/auth.type'
import { IAuthControllerV1 } from './auth-v1.controller.type'
import { EAppJwtServiceSignType } from '@/app/services/app-jwt.service.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'
import { AppJwtService } from '@/app/services/app-jwt.service'
import { AppNodemailerService } from '@/app/services/app-nodemailer.service'
import { UserV1Service } from '@/user/services/user-v1.service'
import { appNodeMailerWrapper } from '@/app/services/app-nodemailer-wrapper.service'

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

// Prisma
import type { users } from '@prisma/client'

const userService = new UserV1Service()
const appJwtService = new AppJwtService()

export class AuthControllerV1
	extends AppCommonService
	implements IAuthControllerV1
{
	/**
	 * @description Generate email with verification code
	 *
	 * @param {EAppJwtServiceSignType} signType
	 * @param {Prisma.users} user
	 *
	 * @return {Promise<void>} Promise<void>
	 */
	_generateEmailWithVerificationCode = async (
		signType: EAppJwtServiceSignType,
		user: users
	): Promise<void> => {
		let subject = `Easy Copies - `
		let text: string

		// Generate jwt token according sign type
		const token = appJwtService.generateToken({ id: user.id }, signType)

		switch (signType) {
			case EAppJwtServiceSignType.VERIFY_USER:
				subject = `${subject} Verify Account ${user.name}`
				text = `Your verify user token is: ${token}`
				break
			case EAppJwtServiceSignType.FORGOT_PASSWORD:
				subject = `${subject} Forgot Password ${user.name}`
				text = `Your forgot password token is: ${token}`
				break
			default:
				subject = `${subject} - IGNORE THIS EMAIL!`
				text = `Ignore this email, this is just a test!`
		}

		return new AppNodemailerService(appNodeMailerWrapper.transporter).sendMail({
			to: user.email,
			subject,
			text
		})
	}

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

			// Send email to user
			await this._generateEmailWithVerificationCode(
				EAppJwtServiceSignType.VERIFY_USER,
				user
			)

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
			const token = appJwtService.generateToken(
				jwtPayload,
				EAppJwtServiceSignType.LOGIN
			)
			const refreshToken = appJwtService.generateToken(
				jwtPayload,
				EAppJwtServiceSignType.REFRESH_TOKEN
			)

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
				EAppJwtServiceSignType.REFRESH_TOKEN
			)) as TUserJwtPayload

			// Generate token again
			const jwtPayload = { id: user.id, email: user.email }
			const token = appJwtService.generateToken(
				jwtPayload,
				EAppJwtServiceSignType.LOGIN
			)
			const newRefreshToken = appJwtService.generateToken(
				jwtPayload,
				EAppJwtServiceSignType.REFRESH_TOKEN
			)

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
	 */
	forgotPassword = {
		validateInput: [body('email').isEmail().withMessage('Email must be valid')],
		config: async (req: Request, res: Response) => {
			const { email } = req.body

			// Check if user exists
			const user = await userService.show({ where: { email } })
			if (!user) throw new ErrorBadRequest('Invalid credentials')

			// Send email to user
			await this._generateEmailWithVerificationCode(
				EAppJwtServiceSignType.FORGOT_PASSWORD,
				user
			)

			const { code, ...restResponse } = SuccessOk({ result: user })
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Forgot password
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
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
	 */
	logout = (req: Request, res: Response) => {
		req.currentUser = undefined

		const { code, ...restResponse } = SuccessOk({ message: 'Logout success' })
		return res.status(code).json(restResponse)
	}

	/**
	 * @description Verify any token with specific sign type
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
	 */
	verify = {
		validateInput: [
			body('signType').not().isEmpty().withMessage('Sign Type is required')
		],
		config: async (req: Request, res: Response) => {
			const { token } = req.params
			const { signType } = req.body

			// Verify token
			const userId = (await appJwtService.verify(
				token,
				signType as EAppJwtServiceSignType
			)) as { id: string }

			const { code, ...restResponse } = SuccessOk({
				result: { validated: Boolean(userId) }
			})
			return res.status(code).json(restResponse)
		}
	}
}
