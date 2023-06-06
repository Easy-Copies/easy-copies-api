// Express
import { Router } from 'express'

// Controller
import { RegionControllerV1 } from '@/region/controllers/region-v1.controller'

// Middlewares
import { appAuthMiddleware } from '@/app/middlewares/app-auth.middleware'

// Initialize anything
const router = Router()
const regionControllerV1 = new RegionControllerV1()
const { provinceList, regencyList, districtList } = regionControllerV1

router.get('/provinces', appAuthMiddleware(), provinceList.config)
router.get('/regencies/:provinceCode', appAuthMiddleware(), regencyList.config)
router.get('/districts/:regencyCode', appAuthMiddleware(), districtList.config)

export { router as regionV1Routes }
