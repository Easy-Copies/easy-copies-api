// Express
import { Router } from 'express'

// Controller
import { TransactionControllerV1 } from '@/transaction/controllers/transaction-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'
import { appValidationMiddleware } from '@/app/middlewares/app-validation.middleware'

// Initialize anything
const router = Router()
const transactionControllerV1 = new TransactionControllerV1()
const { index, store } = transactionControllerV1

router.get('/', appAuthMiddleware({ ...index.permission }), index.config)
router.post(
	'/:storeId',
	appAuthMiddleware({ ...store.permission }),
	store.validateInput,
	appValidationMiddleware,
	store.config
)

export { router as transactionV1Routes }
