// Express
import { Router } from 'express'

// Controller
import { StoreServiceControllerV1 } from '@/store/controllers/store-service-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const storeServiceControllerV1 = new StoreServiceControllerV1()
const { index, store, show, update, destroy } = storeServiceControllerV1

router.get(
	'/detail/:serviceId',
	appAuthMiddleware({ ...show.permission }),
	show.config
)
router.get(
	'/:storeId',
	appAuthMiddleware({ ...index.permission }),
	index.config
)
router.post(
	'/:storeId',
	appAuthMiddleware({ ...store.permission }),
	store.validateInput,
	appValidationMiddleware,
	store.config
)
router.put(
	'/:serviceId',
	appAuthMiddleware({ ...update.permission }),
	update.validateInput,
	appValidationMiddleware,
	update.config
)
router.delete(
	'/:serviceId',
	appAuthMiddleware({ ...destroy.permission }),
	destroy.config
)

export { router as storeServiceV1Routes }
