// Express
import { Router } from 'express'

// Controller
import { AuthControllerV1 } from '@/auth/controllers/auth-v1.controller'

// Initialize anything
const router = Router()
const authControllerV1 = new AuthControllerV1()

router.post(
	'/register',
	authControllerV1.register.validateInput,
	authControllerV1.middleware.validate,
	authControllerV1.register.config
)
router.post(
	'/login',
	authControllerV1.login.validateInput,
	authControllerV1.middleware.validate,
	authControllerV1.login.config
)
router.post(
	'/forgot-password',
	authControllerV1.forgotPassword.validateInput,
	authControllerV1.middleware.validate,
	authControllerV1.forgotPassword.config
)
router.post(
	'/refresh-token',
	authControllerV1.refreshToken.validateInput,
	authControllerV1.middleware.validate,
	authControllerV1.refreshToken.config
)
router.get('/me', authControllerV1.middleware.auth, authControllerV1.me)
router.post('/logout', authControllerV1.middleware.auth, authControllerV1.me)

export { router as authRoutes }
