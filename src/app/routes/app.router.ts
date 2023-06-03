// Express
import { Express, Request, Response } from 'express'

// Routes
import { authV1Routes } from '@/auth/routes/auth-v1.router'
import { roleV1Routes } from '@/user-management/children/role/routes/role-v1.router'
import { userV1Routes } from '@/user-management/children/user/routes/user-v1.router'

// Responses
import { ErrorNotFound } from '@/app/errors'

/**
 * @description Generate routes for the application
 *
 * @param {Express} app
 *
 * @return {void}
 */
export const routesInit = (app: Express): void => {
	app.get('/', (req: Request, res: Response) => {
		res.status(200).json({ message: 'Welcome to Easy Copies!' })
	})

	app.use('/api/v1/auth', authV1Routes)
	app.use('/api/v1/user-management', roleV1Routes)
	app.use('/api/v1/user-management', userV1Routes)

	// Catch any error
	app.all('*', () => {
		throw new ErrorNotFound()
	})
}
