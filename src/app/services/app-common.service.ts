// Types
import {
	TAppCommonService,
	TPagination,
	TPaginationArgs,
	TPaginationArgsPrisma
} from './app-common.service.type'

// Lodash
import omit from 'lodash.omit'

// Bcrypt
import bcrypt from 'bcryptjs'

export class AppCommonService implements TAppCommonService {
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
	 * @description Generate OTP
	 *
	 */
	generateOtp = () => {
		// Declare a digits variable
		// which stores all digits
		const digits = '0123456789'

		let OTP = ''

		for (let i = 0; i < 6; i++) {
			OTP += digits[Math.floor(Math.random() * 10)]
		}

		return OTP
	}

	/**
	 * @description Get pagination page
	 *
	 * @param {string} _page
	 *
	 * @return {number} number
	 */
	private _paginationPage = (_page?: string): number => {
		const currentPage = Number(_page || 0) as number
		const page = currentPage < 1 || currentPage === 1 ? 0 : currentPage - 1

		return page
	}

	/**
	 * @description Pagination argument for prisma
	 *
	 * @param {TPaginationArgs<T>} TPaginationArgs<T>
	 *
	 * @return {T} T
	 */
	paginateArgs = <T extends TPaginationArgsPrisma>(
		args: TPaginationArgs<T>
	): T => {
		const page = this._paginationPage(args?.page as string)
		const take = Number(args?.limit || 10)
		const skip = take * page

		return {
			...omit(args, ['page', 'limit', 'sort', 'column']),
			take: args?.take || take,
			skip: args?.skip || skip,
			orderBy: args?.orderBy || {
				[(args?.column as string) || 'createdAt']: args?.sort || 'desc'
			}
		} as T
	}

	/**
	 * @description Paginate any result
	 *
	 * @param {object} options
	 * @param {TPaginationArgs<TPaginationArgsPrisma>} args
	 *
	 * @return {TPagination<T>} TPagination<T>
	 */
	paginate = <T>(
		{ result, total }: { result: T[]; total: number },
		args: TPaginationArgs<TPaginationArgsPrisma>
	): TPagination<T> => {
		const page = this._paginationPage(args?.page)
		const { take } =
			this.paginateArgs<TPaginationArgs<TPaginationArgsPrisma>>(args)
		const sort = args?.sort || 'desc'
		const totalRows = total
		const totalPages = Math.ceil(totalRows / (take as number))

		const paginatedResponse = {
			limit: take as number,
			totalPages,
			totalRows,
			page: page + 1,
			rows: result as T[],
			sort
		}

		return paginatedResponse
	}
}
