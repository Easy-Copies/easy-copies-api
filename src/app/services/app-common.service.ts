// Types
import {
	TAppCommonService,
	TPrismaPaginateArgs,
	TPrismaPaginateResponse
} from './app-common.service.type'

// Lodash
import omit from 'lodash.omit'

// Express
import { Request } from 'express'

// Bcrypt
import bcrypt from 'bcryptjs'

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
	 * @description Hash password
	 *
	 *
	 */
	hashPassword = async (password: string) => {
		// Hash password
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		return hashedPassword
	}

	/**
	 * @description Paginate prisma
	 *
	 */
	paginate = async <T = unknown>(
		// eslint-disable-next-line
		model: any,
		args?: TPrismaPaginateArgs
	): Promise<TPrismaPaginateResponse<T>> => {
		const currentPage = args?.page || 0
		const page = currentPage < 1 || currentPage === 1 ? 0 : currentPage - 1
		const take = args?.limit || 10
		const skip = take * page
		const sort = args?.sort || 'desc'
		const rows = await model.findMany({
			...omit(args, ['page', 'limit', 'sort', 'column']),
			take,
			skip,
			orderBy: {
				[args?.column || 'createdAt']: sort
			}
		})
		const totalRows = await model.count()
		const totalPages = Math.ceil(totalRows / take)

		const paginateResponse = {
			limit: take,
			totalPages,
			totalRows,
			page: page + 1,
			rows: rows.map(
				// eslint-disable-next-line
				(row: any) => {
					if (row?.password) {
						return omit(row, ['password'])
					} else {
						return row
					}
				}
			),
			sort
		} as TPrismaPaginateResponse<T>

		return Promise.resolve(paginateResponse)
	}
}
