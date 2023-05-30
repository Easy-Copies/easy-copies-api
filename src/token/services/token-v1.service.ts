// Types
import { ITokenV1Service } from './token-v1.service.type'

// Prisma
import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'

export class TokenV1Service implements ITokenV1Service {
	constructor(private db: PrismaClient) {}

	/**
	 * @description Get list of tokens
	 *
	 * @param {Prisma.TokenFindManyArgs} args
	 *
	 * @return {Promise<Token>} Promise<Token>
	 */
	index = (args?: Prisma.TokenFindManyArgs) => {
		return this.db.token.findMany(args)
	}

	/**
	 * @description store token
	 *
	 * @param {Prisma.TokenCreateArgs} args
	 *
	 * @return {Promise<Token>} Promise<Token>
	 */
	store = (args: Prisma.TokenCreateArgs) => {
		return this.db.token.create(args)
	}

	/**
	 * @description Get single token
	 *
	 * @param {Prisma.TokenFindFirstArgs} args
	 *
	 * @return {Promise<Token>} Promise<Token>
	 */
	show = (args: Prisma.TokenFindFirstArgs) => {
		return this.db.token.findFirst(args)
	}

	/**
	 * @description Update single token
	 *
	 * @param {Prisma.TokenUpdateArgs} args
	 *
	 * @return {Promise<Token>} Promise<Token>
	 */
	update = (args: Prisma.TokenUpdateArgs) => {
		return this.db.token.update(args)
	}

	/**
	 * @description Destroy single token
	 *
	 * @param {Prisma.TokenDeleteArgs} args
	 *
	 * @return {Promise<Token>} Promise<Token>
	 */
	destroy = (args: Prisma.TokenDeleteArgs) => {
		return this.db.token.delete(args)
	}

	/**
	 * @description Destroy multiple token
	 *
	 * @param {Prisma.TokenDeleteManyArgs} args
	 *
	 * @return {Promise<Token>} Promise<Token>
	 */
	destroyMany = (args: Prisma.TokenDeleteManyArgs) => {
		return this.db.token.deleteMany(args)
	}
}
