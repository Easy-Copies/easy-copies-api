// Prisma
import type { Prisma } from '@prisma/client'

export type TPrismaPaginateArgs = Prisma.RoleFindManyArgs & {
	params: {
		page?: number | undefined
		limit?: number | undefined
		sort?: string | undefined
		column?: string | undefined
	}
	prisma: {
		take: any
		skip: any
		orderBy: any
	}
}

export type TPaginationArgsPrisma = {
	orderBy?: any | undefined
}

export type TPaginationArgs<T extends TPaginationArgsPrisma> = T & {
	take?: number | undefined
	skip?: number | undefined
	orderBy?: T['orderBy'] | undefined
	page?: string | undefined
	limit?: string | undefined
	sort?: string | undefined
	column?: string | undefined
}

export type TPagination<T> = {
	limit: number
	totalPages: number
	totalRows: number
	page: number
	rows: T[]
	sort: string
}

export type TPrismaPaginateResponse<T = unknown> = {
	limit: number
	page: number
	sort: string
	totalRows: number
	totalPages: number
	rows: T[]
}

export type TPaginateResult<T> = { result: T[]; total: number }

export type TAppCommonService = {
	generateOtp: () => string
	paginateArgs: <T extends TPaginationArgsPrisma>(args: TPaginationArgs<T>) => T
	paginate: <T>(
		result: TPaginateResult<T>,
		args: TPaginationArgs<TPaginationArgsPrisma>
	) => TPagination<T>
	hashPassword: (password: string) => Promise<string>
}
