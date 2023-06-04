// Express
import { Router } from 'express'

// Controller
import { AuthControllerV1 } from '@/auth/controllers/auth-v1.controller'

// Middleware
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const authControllerV1 = new AuthControllerV1()
const {
	register,
	login,
	forgotPassword,
	refreshToken,
	me,
	logout,
	verify,
	changeActiveRole
} = authControllerV1

router.post(
	'/register',
	register.validateInput,
	appValidationMiddleware,
	register.config
)
router.post(
	'/login',
	login.validateInput,
	appValidationMiddleware,
	login.config
)
router.post(
	'/forgot-password',
	forgotPassword.validateInput,
	appValidationMiddleware,
	forgotPassword.config
)
router.post(
	'/refresh-token',
	refreshToken.validateInput,
	appValidationMiddleware,
	refreshToken.config
)
router.get('/me', appAuthMiddleware, me)
router.post('/logout', appAuthMiddleware, logout)
router.post(
	'/verify/:token',
	verify.validateInput,
	appValidationMiddleware,
	verify.config
)
router.put(
	'/roles/change-active',
	appAuthMiddleware,
	changeActiveRole.validateInput,
	appValidationMiddleware,
	changeActiveRole.config
)

export { router as authV1Routes }
