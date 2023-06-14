// Express
import { Router } from 'express'

// Controller
import { TransactionApprovalControllerV1 } from '@/transaction/controllers/transaction-approval-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const transactionApprovalControllerV1 = new TransactionApprovalControllerV1()
const { handle, approvalStatusList, cancel } = transactionApprovalControllerV1

router.put(
	'/handle/:transactionId',
	appAuthMiddleware({ ...handle.permission }),
	handle.validateInput,
	appValidationMiddleware,
	handle.config
)
router.get(
	'/statuses/:transactionId',
	appAuthMiddleware({ ...approvalStatusList.permission }),
	approvalStatusList.config
)
router.put(
	'/cancel/:transactionId',
	appAuthMiddleware({ ...cancel.permission }),
	cancel.config
)

export { router as transactionApprovalV1Routes }
