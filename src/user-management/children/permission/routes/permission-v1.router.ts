// Express
import { Router } from 'express'

// Controller
import { PermissionControllerV1 } from '@/user-management/children/permission/controllers/permission-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'

// Initialize anything
const router = Router()
const permissionControllerV1 = new PermissionControllerV1()
const { index, show } = permissionControllerV1

router.get('/', appAuthMiddleware, index)
router.get('/:code', appAuthMiddleware, show)

export { router as permissionV1Routes }
