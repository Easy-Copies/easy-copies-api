// Prisma
import type { Prisma } from '@prisma/client'

// Express
import { Request } from 'express'

export type TPrismaPaginateArgs = Prisma.RoleFindManyArgs & {
	page?: number | undefined
	limit?: number | undefined
	sort?: string | undefined
	column?: string | undefined
}

export type TPrismaPaginateResponse<T = unknown> = {
	limit: number
	page: number
	sort: string
	totalRows: number
	totalPages: number
	rows: T[]
}

export type TAppCommonService = {
	parsePaginationArgs: (query: Request['query']) => TPrismaPaginateArgs
	paginate: <T>(
		model: any,
		args?: TPrismaPaginateArgs
	) => Promise<TPrismaPaginateResponse<T>>
	hashPassword: (password: string) => Promise<string>
}
