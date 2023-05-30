// Types
import {
	TAppCommonService,
	TPrismaPaginateArgs,
	TPrismaPaginateModel,
	TPrismaPaginateResponse
} from './app-common.service.type'

// Lodash
import omit from 'lodash.omit'

// Express
import { Request } from 'express'

export class AppCommonService implements TAppCommonService {
	/**
	 * @description Parse pagination args
	 *
	 */
	parsePaginationArgs = (query: Request['query']) => {
		const { limit, page, sort, column } = query

		return {
			limit: Number(limit),
			page: Number(page),
			sort: sort ? (sort as string) : undefined,
			column: column ? (column as string) : undefined
		}
	}

	/**
	 * @description Paginate prisma
	 *
	 */
	paginate = async <T = unknown>(
		model: TPrismaPaginateModel,
		args?: TPrismaPaginateArgs
	): Promise<TPrismaPaginateResponse<T>> => {
		const currentPage = args?.page || 0
		const page = currentPage < 1 || currentPage === 1 ? 0 : currentPage - 1
		const take = args?.limit || 10
		const skip = take * page
		const rows = await model.findMany({
			...omit(args, ['page', 'limit', 'sort', 'column']),
			take,
			skip,
			orderBy: {
				[args?.column || 'createdAt']: args?.sort || 'desc'
			}
		})
		const totalRows = await model.count()
		const totalPages = Math.ceil(totalRows / take)

		const paginateResponse = {
			limit: take,
			totalPages,
			totalRows,
			page: page + 1,
			rows,
			sort: 'desc'
		} as TPrismaPaginateResponse<T>

		return Promise.resolve(paginateResponse)
	}
}
