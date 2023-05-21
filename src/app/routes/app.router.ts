// Express
import { Express } from 'express'

// Routes
import { authRoutes } from '@/auth/routes/auth.router'

// Responses
import { NotFoundResponse } from '@/app/responses'

/**
 * @description Generate routes for the application
 *
 * @param {Express} app
 *
 * @return {void}
 */
export const routesInit = (app: Express): void => {
	app.use('/api/v1/auth', authRoutes)

	// Catch any error
	app.all('*', () => {
		throw new NotFoundResponse()
	})
}
