// Express
import { Router } from 'express'

// Controller
import { StoreApprovalController } from '@/store/controllers/store-approval-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const storeControllerV1 = new StoreApprovalController()
const { handle, cancel } = storeControllerV1

router.put(
	'/handle/:storeId',
	appAuthMiddleware({ ...handle.permission }),
	handle.validateInput,
	appValidationMiddleware,
	handle.config
)
router.put(
	'/cancel/:storeId',
	appAuthMiddleware({ ...cancel.permission }),
	cancel.config
)

export { router as storeApprovalV1Routes }
