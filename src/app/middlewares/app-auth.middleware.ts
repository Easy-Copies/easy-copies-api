// Express
import { Request, Response, NextFunction } from 'express'

// JWT
import jwt from 'jsonwebtoken'

// Utils
import { ErrorBadRequest, ErrorUnauthorized } from '@/app/errors'

// Types
import { TUserJwtPayload } from '@/auth/types/auth.type'

declare global {
	namespace Express {
		interface Request {
			currentUser?: TUserJwtPayload
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
			throw new ErrorBadRequest('Authorization header should be exists')
		}
		const token = authorizationHeader.split(' ')?.[1]
		if ([false, null, 'null'].includes(token)) {
			throw new ErrorBadRequest(
				'Authorization header should have token, or maybe your token is null'
			)
		}

		const user = (await jwt.verify(
			token,
			process.env.JWT_KEY as string
		)) as TUserJwtPayload

		req.currentUser = user
	} finally {
		//
	}

	// Check if there is no current user exists
	if (!req.currentUser) {
		throw new ErrorUnauthorized()
	}

	return next()
}

export { appAuthMiddleware }
