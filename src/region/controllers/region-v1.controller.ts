// Types
import { IRegionControllerV1 } from './region-v1.controller.type'

// Express
import { Request, Response } from 'express'

// Responses
import { SuccessOk } from '@/app/success/success'

// Prisma
import { PrismaClient } from '@prisma/client'

// Init Prisma
const prisma = new PrismaClient()

export class RegionControllerV1 implements IRegionControllerV1 {
	/**
	 * @description Get province list
	 *
	 *
	 */
	provinceList = {
		validateInput: [],
		config: async (req: Request, res: Response) => {
			const provinceList = await prisma.province.findMany({
				orderBy: { name: 'asc' }
			})

			const { code, ...restResponse } = SuccessOk({
				result: provinceList
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get regency list
	 *
	 *
	 */
	regencyList = {
		validateInput: [],
		config: async (req: Request, res: Response) => {
			const { provinceCode } = req.params

			const regencyList = await prisma.regency.findMany({
				orderBy: { name: 'asc' },
				where: { provinceCode }
			})

			const { code, ...restResponse } = SuccessOk({
				result: regencyList
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get regency list
	 *
	 *
	 */
	districtList = {
		validateInput: [],
		config: async (req: Request, res: Response) => {
			const { regencyCode } = req.params

			const regencyList = await prisma.district.findMany({
				orderBy: { name: 'asc' },
				where: { regencyCode }
			})

			const { code, ...restResponse } = SuccessOk({
				result: regencyList
			})
			return res.status(code).json(restResponse)
		}
	}
}
