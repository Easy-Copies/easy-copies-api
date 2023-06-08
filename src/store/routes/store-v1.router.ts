// Express
import { Router } from 'express'

// Controller
import { StoreControllerV1 } from '@/store/controllers/store-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const storeControllerV1 = new StoreControllerV1()
const { index, store, show, update, destroy, cancelStore } = storeControllerV1

router.put(
	'/cancel/:id',
	appAuthMiddleware({ ...cancelStore.permission }),
	cancelStore.config
)
router.get('/', appAuthMiddleware({ ...index.permission }), index.config)
router.post(
	'/',
	appAuthMiddleware({ ...store.permission }),
	store.validateInput,
	appValidationMiddleware,
	store.config
)
router.get('/:id', appAuthMiddleware({ ...show.permission }), show.config)
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

export { router as storeV1Routes }
