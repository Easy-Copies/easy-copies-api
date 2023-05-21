// Express
import { Request, Response, NextFunction } from 'express'

// JWT
import jwt from 'jsonwebtoken'

// Responses
import { BadRequestResponse, UnauthorizedResponse } from '@/app/responses'

interface IUserPayload {
	id: string
	email: string
}

declare global {
	namespace Express {
		interface Request {
			currentUser?: IUserPayload
		}
	}
}

const appAuthMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Check for authorization header
		const authorizationHeader = req.headers?.authorization

		if (!authorizationHeader) {
			throw new BadRequestResponse('Authorization header should be exists')
		}
		const token = authorizationHeader.split(' ')?.[1]
		if ([false, null, 'null'].includes(token)) {
			throw new BadRequestResponse(
				'Authorization header should have token, or maybe your token is null'
			)
		}

		const user = (await jwt.verify(
			token,
			process.env.JWT_KEY as string
		)) as IUserPayload

		req.currentUser = user
	} finally {
		//
	}

	// Check if there is no current user exists
	if (!req.currentUser) {
		throw new UnauthorizedResponse()
	}

	return next()
}

export { appAuthMiddleware }
