// Express
import { Router } from 'express'

// Controller
import { StoreApprovalControllerV1 } from '@/store/controllers/store-approval-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const storeApprovalControllerV1 = new StoreApprovalControllerV1()
const { handle, approvalStatusList, cancel } = storeApprovalControllerV1

router.put(
	'/handle/:storeId',
	appAuthMiddleware({ ...handle.permission }),
	handle.validateInput,
	appValidationMiddleware,
	handle.config
)
router.get(
	'/statuses/:storeId',
	appAuthMiddleware({ ...approvalStatusList.permission }),
	approvalStatusList.config
)
router.put(
	'/cancel/:storeId',
	appAuthMiddleware({ ...cancel.permission }),
	cancel.config
)

export { router as storeApprovalV1Routes }
