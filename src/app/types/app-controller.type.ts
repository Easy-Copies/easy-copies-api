// Express
import { NextFunction, Request, Response } from 'express'

// Express Validator
import { ValidationChain } from 'express-validator'

export type IAppControllerConfigReturn = {
	validateInput: ValidationChain[]
	config: (req: Request, res: Response, next?: NextFunction) => any
}
