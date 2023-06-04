// Express
import { Router } from 'express'

// Controller
import { UserControllerV1 } from '@/user-management/children/user/controllers/user-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const userControllerV1 = new UserControllerV1()
const { index, store, show, update, destroy } = userControllerV1

router.get('/', appAuthMiddleware, index)
router.post(
	'/',
	appAuthMiddleware,
	store.validateInput,
	appValidationMiddleware,
	store.config
)
router.get('/:id', appAuthMiddleware, show)
router.put(
	'/:id',
	appAuthMiddleware,
	update.validateInput,
	appValidationMiddleware,
	update.config
)
router.delete('/:id', appAuthMiddleware, destroy)

export { router as userV1Routes }
