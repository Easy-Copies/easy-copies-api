// Types
import { appValidationMiddleware } from '../middlewares/app-validation.middleware'
import { TAppCommonService } from './app-common.service.type'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'

export class AppCommonService implements TAppCommonService {
	middleware = {
		auth: appAuthMiddleware,
		validate: appValidationMiddleware
	}
}
