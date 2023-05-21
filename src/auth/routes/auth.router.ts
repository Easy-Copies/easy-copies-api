// Express
import { Router } from 'express'

// Controller
import { AuthControllerV1 } from '@/auth/controllers/auth-v1.controller'

// Initialize anything
const router = Router()
const authControllerV1 = new AuthControllerV1()

router.post('/register', authControllerV1.register)
router.post(
	'/login',
	authControllerV1.login.validateInput,
	authControllerV1.middleware.validate,
	authControllerV1.login.config
)
router.post('/forgot-password', authControllerV1.forgotPassword)
router.get('/me', authControllerV1.middleware.auth, authControllerV1.me)

export { router as authRoutes }
