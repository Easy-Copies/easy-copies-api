// Express
import { Express, Request, Response } from 'express'

// Routes
import { authV1Routes } from '@/auth/routes/auth-v1.router'
import { roleV1Routes } from '@/user-management/children/role/routes/role-v1.router'
import { userV1Routes } from '@/user-management/children/user/routes/user-v1.router'
import { permissionV1Routes } from '@/user-management/children/permission/routes/permission-v1.router'
import { regionV1Routes } from '@/region/routes/region-v1.router'
import { storeV1Routes } from '@/store/routes/store-v1.router'

// Responses
import { ErrorNotFound } from '@/app/errors'

/**
 * @description Generate routes for the application
 *
 * @param {Express} app
 *
 * @return {void} void
 */
export const routesInit = (app: Express): void => {
	app.get('/', (req: Request, res: Response) => {
		res.status(200).json({ message: 'Welcome to Easy Copies!' })
	})

	app.use('/api/v1/auth', authV1Routes)
	app.use('/api/v1/user-management/roles', roleV1Routes)
	app.use('/api/v1/user-management/users', userV1Routes)
	app.use('/api/v1/user-management/permissions', permissionV1Routes)
	app.use('/api/v1/regions', regionV1Routes)
	app.use('/api/v1/stores', storeV1Routes)

	// Catch any error
	app.all('*', () => {
		throw new ErrorNotFound()
	})
}
