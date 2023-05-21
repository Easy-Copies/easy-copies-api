// Type
import { IAuthControllerV1 } from './auth-v1.controller.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'

// Express
import { Request, Response } from 'express'

// Express Validator
import { body } from 'express-validator'

// Responses
import { ok } from '@/app/responses'

export class AuthControllerV1
	extends AppCommonService
	implements IAuthControllerV1
{
	/**
	 * @description Log user in
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
	 * @return {any}
	 */
	login = {
		validateInput: [
			body('email').isEmail().withMessage('Email must be valid'),
			body('password').not().isEmpty().withMessage('Password is required')
		],
		config: (req: Request, res: Response) => {
			return ok(res, { message: 'Login', result: null })
		}
	}

	/**
	 * @description Register a new user
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
	 * @return {any}
	 */
	register = async (req: Request, res: Response) => {
		return res.json({ message: 'Register!' })
	}

	/**
	 * @description Forgot password
	 *
	 * @param {Request} req
	 * @param {Response} res
	 *
	 * @return {any}
	 */
	forgotPassword = async (req: Request, res: Response) => {
		return res.json({ message: 'Forgot password!' })
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
		return res.json({ message: 'Me' })
	}
}
