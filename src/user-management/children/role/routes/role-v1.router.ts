// Express
import { Router } from 'express'

// Controller
import { RoleControllerV1 } from '@/user-management/children/role/controllers/role-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const roleControllerV1 = new RoleControllerV1()
const { index, store, show, update, destroy } = roleControllerV1

router.get('/roles', appAuthMiddleware, index)
router.post(
	'/roles',
	appAuthMiddleware,
	store.validateInput,
	appValidationMiddleware,
	store.config
)
router.get('/roles/:id', appAuthMiddleware, show)
router.put(
	'/roles/:id',
	appAuthMiddleware,
	update.validateInput,
	appValidationMiddleware,
	update.config
)
router.delete('/roles/:id', appAuthMiddleware, destroy)

export { router as roleV1Routes }
