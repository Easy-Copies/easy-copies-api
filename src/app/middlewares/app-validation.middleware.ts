// Express
import { Request, Response, NextFunction } from 'express'

// Express Validator
import { validationResult } from 'express-validator'

// Error
import { ValidationResponse } from '@/app/responses'

const appValidationMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) throw new ValidationResponse(errors.array())

	next()
}

export { appValidationMiddleware }
