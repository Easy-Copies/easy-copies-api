// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Express
import { NextFunction, Request, Response } from 'express'

// Express Validator
import { ValidationChain } from 'express-validator'

// Prisma
import type { PrismaClient } from '@prisma/client'

export interface IAppController {
	middleware: {
		auth: typeof appAuthMiddleware
		validate: typeof appValidationMiddleware
	}
	prisma: PrismaClient
}

export type IAppControllerConfigReturn = {
	validateInput: ValidationChain[]
	config: (req: Request, res: Response, next?: NextFunction) => any
}
