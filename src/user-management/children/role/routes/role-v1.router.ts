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
const { index, store, show, update, destroy, assignPermission } =
	roleControllerV1

router.get('/', appAuthMiddleware({ ...index.permission }), index.config)
router.post(
	'/',
	appAuthMiddleware({ ...store.permission }),
	store.validateInput,
	appValidationMiddleware,
	store.config
)
router.get('/:id', appAuthMiddleware({ ...store.permission }), show.config)
router.put(
	'/:id',
	appAuthMiddleware({ ...update.permission }),
	update.validateInput,
	appValidationMiddleware,
	update.config
)
router.delete(
	'/:id',
	appAuthMiddleware({ ...destroy.permission }),
	destroy.config
)
router.put(
	'/permissions/assign/:id',
	appAuthMiddleware({ ...assignPermission.permission }),
	assignPermission.validateInput,
	appValidationMiddleware,
	assignPermission.config
)

export { router as roleV1Routes }
