// Express
import { Request, Response } from 'express'

// Error
import { BaseResponse } from '@/app/responses'

// JWT
import { JsonWebTokenError } from 'jsonwebtoken'

const appErrorMiddleware = (err: Error, req: Request, res: Response) => {
	// Common Error
	if (err instanceof BaseResponse) {
		return res.status(err.statusCode).json({ errors: err.serializeResponse() })
	}

	// JWT Error
	if (err instanceof JsonWebTokenError) {
		return res.status(400).json({ errors: [{ message: err.message }] })
	}

	res.status(500).json({ errors: [{ message: 'Something went wrong' }] })
}

export { appErrorMiddleware }
