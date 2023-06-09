// Types
import { TUserJwtPayload } from '@/auth/types/auth.type'
import { IAuthControllerV1 } from './auth-v1.controller.type'
import {
	EAppJwtServiceSignType,
	TAppJwtServiceDecode
} from '@/app/services/app-jwt.service.type'

// Services
import { AppJwtService } from '@/app/services/app-jwt.service'
import { AppNodemailerService } from '@/app/services/app-nodemailer.service'
import { appNodeMailerWrapper } from '@/app/services/app-nodemailer-wrapper.service'
import { TokenV1Service } from '@/token/services/token-v1.service'
import { AppCommonService } from '@/app/services/app-common.service'

// Express
import { Request, Response } from 'express'

// Express Validator
import { body } from 'express-validator'

// Responses
import { SuccessOk, SuccessCreated } from '@/app/success/success'

// Bcrypt
import bcrypt from 'bcryptjs'

// Errors
import { ErrorBadRequest, ErrorNotFound, ErrorValidation } from '@/app/errors'

// Lodash
import omit from 'lodash.omit'
import pick from 'lodash.pick'

// Prisma
import { User, Token, PrismaClient } from '@prisma/client'

// Moment
import moment from 'moment'

// Init Prisma
const prisma = new PrismaClient()

// Services
const appCommonService = new AppCommonService()
const appJwtService = new AppJwtService()
const tokenV1Service = new TokenV1Service(prisma)

export class AuthControllerV1 implements IAuthControllerV1 {
	/**
	 * @description Generate email with verification code
	 *
	 * @param {EAppJwtServiceSignType} signType
	 * @param {Prisma.User} user
	 * @param {object} options
	 *
	 * @return {Promise<Token>} Promise<Token>
	 */
	_generateEmailWithVerificationCode = async (
		signType: EAppJwtServiceSignType,
		user: User,
		options?: { isMobile?: boolean }
	): Promise<Token> => {
		let subject = `Easy Copies - `
		let text: string
		let mappedToken: string
		const isMobile = options?.isMobile
		let payload: TAppJwtServiceDecode = { id: user.id }

		// Check if coming from mobile
		// Generate extra payload
		if (isMobile) {
			payload = {
				...payload,
				otp: appCommonService.generateOtp(),
				isMobile
			}
		}

		// Generate jwt token according sign type
		const token = appJwtService.generateToken(payload, signType)

		// Check if coming from mobile
		// Decode the token
		if (isMobile) {
			mappedToken = appJwtService.decode(token).otp as string
		} else {
			mappedToken = token
		}

		switch (signType) {
			case EAppJwtServiceSignType.VERIFY_USER:
				subject = `${subject} Verify Account ${user.name}`
				text = `Your verify user ${
					isMobile ? 'otp' : 'token'
				} is: ${mappedToken}`
				break
			case EAppJwtServiceSignType.FORGOT_PASSWORD:
				subject = `${subject} Forgot Password ${user.name}`
				text = `Your forgot password ${
					isMobile ? 'otp' : 'token'
				} is: ${mappedToken}`
				break
			default:
				subject = `${subject} - IGNORE THIS EMAIL!`
				text = `Ignore this email, this is just a test!`
		}

		// Send mail to specific user
		await new AppNodemailerService(appNodeMailerWrapper.transporter).sendMail({
			to: user.email,
			subject,
			text
		})

		// Get any tokens with specific signType
		const tokenFromDatabase = await tokenV1Service.index({
			where: { type: signType, userId: user.id, usedAt: null }
		})

		// If theres any token before, just remove the token!
		if (tokenFromDatabase.length > 0)
			await tokenV1Service.destroyMany({
				where: { id: { in: tokenFromDatabase.map(token => token.id) } }
			})

		// Return promise from prisma
		// And also Save token to DB, for (white/black)listing
		return tokenV1Service.store({
			data: { userId: user.id, token, type: signType }
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
			const isMobile = req.headers?.['x-is-mobile'] === '1'
			const { name, password } = req.body
			let { email } = req.body

			email = email.replace(/\s+/, '').trim().toLowerCase()

			// Check if user exists before
			const existedUser = await prisma.user.findFirst({
				where: { email }
			})
			if (existedUser) throw new ErrorBadRequest('Email currently in used')

			// Hash password
			const salt = await bcrypt.genSalt(10)
			const hashedPassword = await bcrypt.hash(password, salt)

			// Create new user
			const user = await prisma.user.create({
				data: { name, email, password: hashedPassword }
			})

			// Send email to user
			await this._generateEmailWithVerificationCode(
				EAppJwtServiceSignType.VERIFY_USER,
				user,
				{ isMobile }
			)

			const { code, ...restResponse } = SuccessCreated({
				message:
					'You successfully registered, please check email for verify your account',
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
			const isMobile = req.headers?.['x-is-mobile'] === '1'
			const { email, password } = req.body

			// Find correct user
			const user = await prisma.user.findFirst({ where: { email } })
			if (!user) throw new ErrorBadRequest('Invalid credentials')

			// Verify user password
			const isPasswordCorrect = await bcrypt.compare(password, user.password)
			if (!isPasswordCorrect) throw new ErrorBadRequest('Invalid credentials')

			// Check if user not verified yet
			// If user not verified, send an email for verification!
			if (!user.isUserVerified) {
				await this._generateEmailWithVerificationCode(
					EAppJwtServiceSignType.VERIFY_USER,
					user,
					{ isMobile }
				)
			}

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

			const { code, ...restResponse } = SuccessOk({
				result: { token, refreshToken }
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Refresh token
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
	 */
	forgotPassword = {
		validateInput: [body('email').isEmail().withMessage('Email must be valid')],
		config: async (req: Request, res: Response) => {
			const isMobile = req.headers?.['x-is-mobile'] === '1'
			const { email } = req.body

			// Check if user exists
			const user = await prisma.user.findFirst({ where: { email } })
			if (!user) throw new ErrorBadRequest('Invalid credentials')

			// Send email to user
			await this._generateEmailWithVerificationCode(
				EAppJwtServiceSignType.FORGOT_PASSWORD,
				user,
				{ isMobile }
			)

			const { code, ...restResponse } = SuccessOk({
				message: 'Forgot password token successfully sent to your email',
				result: omit(user, ['password'])
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
	me = async (req: Request, res: Response) => {
		// Find current user
		const user = await prisma.user.findFirst({
			where: { id: req.currentUser?.id as string }
		})

		// Find current user roles
		const userRoles = await prisma.roleUser.findMany({
			where: { userId: user?.id },
			include: { role: true },
			orderBy: { role: { name: 'asc' } }
		})

		// Find current user role permissions
		const userRolePermissions = await prisma.permissionRole.findMany({
			where: {
				roleId: { in: userRoles.map(userRole => userRole.roleId) }
			},
			orderBy: { permission: { code: 'asc' } }
		})

		// Get all permissions
		const permissions = await prisma.permission.findMany({
			orderBy: { code: 'asc' }
		})

		const { code, ...restResponse } = SuccessOk({
			result: omit(
				{
					...user,
					roles: userRoles.map(userRole => ({
						...omit(userRole, ['userId', 'roleId', 'role']),
						roleName: userRole.role.name,
						id: userRole.roleId,
						permissions: permissions.map(permission => ({
							...permission,
							actions: userRolePermissions.find(
								userRolePermission =>
									userRolePermission.permissionCode === permission.code &&
									userRolePermission.roleId === userRole.roleId
							)?.actions || {
								create: false,
								read: false,
								update: false,
								delete: false
							}
						}))
					}))
				},
				['password']
			)
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
	 */
	verify = {
		validateInput: [
			body('signType').not().isEmpty().withMessage('Sign Type is required')
		],
		config: async (req: Request, res: Response) => {
			const isMobile = req.headers?.['x-is-mobile'] === '1'
			let { token } = req.params
			const { signType, userId, password } = req.body

			// Common State
			const transactions = []
			let message = ''

			// Check if token is coming from mobile
			// Note, token from mobile is OTP not pure JWT
			// Note, token from web is pure JWT
			// Note, find token that isn't used
			if (isMobile) {
				const tokenBySignType = await tokenV1Service.show({
					where: { type: signType, userId, usedAt: null }
				})
				if (!tokenBySignType)
					throw new ErrorNotFound(
						'OTP not registered in our system or already expired'
					)

				const decodeOtpTokenBySignType = appJwtService.decode(
					tokenBySignType.token
				).otp as string

				// Check if otp is the same as decoded jwt token
				if (token === decodeOtpTokenBySignType) {
					token = tokenBySignType.token
				} else {
					throw new ErrorBadRequest('Invalid OTP')
				}
			}

			// Check if token exists inside database
			// Check if token not used!
			const tokenFromDatabase = await tokenV1Service.show({
				where: { token, usedAt: null }
			})
			if (!tokenFromDatabase) throw new ErrorNotFound('Token not found!')

			// Verify token
			const user = (await appJwtService.verify(
				token,
				signType as EAppJwtServiceSignType
			)) as { id: string }

			// Check if user exists in database
			const userFromDatabase = await prisma.user.findFirst({
				where: { id: user.id }
			})
			if (!userFromDatabase) throw new ErrorNotFound('User not found!')

			// Update token, that token is already used
			const updateDatabaseToken = tokenV1Service.update({
				where: { id: tokenFromDatabase.id },
				data: { usedAt: moment().toISOString() }
			})
			transactions.push(updateDatabaseToken)

			// if signType is "EAppJwtServiceSignType.VerifyUser" then update user
			if (signType === EAppJwtServiceSignType.VERIFY_USER) {
				// Update user verified identifier
				const updateUser = prisma.user.update({
					where: { id: userFromDatabase.id },
					data: { isUserVerified: true }
				})

				// Set message
				message = `Your account activation success`

				transactions.push(updateUser)
			}

			// if signType is "EAppJwtServiceSignType.ForgotPassword"
			if (signType === EAppJwtServiceSignType.FORGOT_PASSWORD) {
				// Check if theres any password pass in
				if (!password || password.length < 8)
					throw new ErrorValidation([
						{
							msg: 'Password minimal length must 8',
							param: 'password'
						}
					])

				// Change user password
				const hashedPassword = await bcrypt.hash(
					password,
					await bcrypt.genSalt(10)
				)
				const updateUser = prisma.user.update({
					where: { id: userFromDatabase.id },
					data: { password: hashedPassword }
				})

				message = 'You successfully change your password'

				transactions.push(updateUser)
			}

			// Run transaction
			await prisma.$transaction(transactions)

			const { code, ...restResponse } = SuccessOk({
				message
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get current user role list
	 *
	 */
	roleList = {
		validateInput: [],
		config: async (req: Request, res: Response) => {
			const roles = await prisma.roleUser.findMany({
				where: { userId: req.currentUser?.id as string },
				include: { role: true }
			})

			const { code, ...restResponse } = SuccessOk({
				result: roles.map(role => ({
					...pick(role.role, ['id', 'name']),
					isActive: role.isActive
				}))
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Change active role of active user
	 *
	 *
	 */
	changeActiveRole = {
		validateInput: [
			body('roleId').not().isEmpty().withMessage('Role ID is required')
		],
		config: async (req: Request, res: Response) => {
			const { roleId } = req.body

			// Check if role exists
			const role = await prisma.role.findFirst({ where: { id: roleId } })
			if (!role) throw new ErrorNotFound('Role not found')

			// Check if user have selected role
			const attachedUserRole = await prisma.roleUser.findFirst({
				where: { userId: req.currentUser?.id as string, roleId }
			})
			if (!attachedUserRole)
				throw new ErrorBadRequest(
					'You have no permission to change to that role'
				)

			// Transact
			await prisma.$transaction([
				// Inactive previous roles if user have
				prisma.roleUser.updateMany({
					where: { userId: req.currentUser?.id as string, NOT: { roleId } },
					data: { isActive: false }
				}),

				// Make selected role active
				prisma.roleUser.update({
					where: {
						userId_roleId: { userId: req.currentUser?.id as string, roleId }
					},
					data: { isActive: true }
				})
			])

			const { code, ...restResponse } = SuccessOk({
				message: `Role ${role.name} successfully activated`
			})
			return res.status(code).json(restResponse)
		}
	}
}
