// Types
import { IUserV1Service } from './user-v1.service.type'

// Prisma
import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'

export class UserV1Service implements IUserV1Service {
	constructor(private db: PrismaClient) {}

	/**
	 * @description Get list of users
	 *
	 * @param {Prisma.UserFindManyArgs} args
	 *
	 * @return {Promise<User>} Promise<User>
	 */
	index = (args?: Prisma.UserFindManyArgs) => {
		return this.db.user.findMany(args)
	}

	/**
	 * @description store user
	 *
	 * @param {Prisma.UserCreateArgs} args
	 *
	 * @return {Promise<User>} Promise<User>
	 */
	store = (args: Prisma.UserCreateArgs) => {
		return this.db.user.create(args)
	}

	/**
	 * @description Get single user
	 *
	 * @param {Prisma.UserFindFirstArgs} args
	 *
	 * @return {Promise<User>} Promise<User>
	 */
	show = (args: Prisma.UserFindFirstArgs) => {
		return this.db.user.findFirst(args)
	}

	/**
	 * @description Update single user
	 *
	 * @param {Prisma.UserUpdateArgs} args
	 *
	 * @return {Promise<User>} Promise<User>
	 */
	update = (args: Prisma.UserUpdateArgs) => {
		return this.db.user.update(args)
	}

	/**
	 * @description Destroy single user
	 *
	 * @param {Prisma.UserDeleteArgs} args
	 *
	 * @return {Promise<User>} Promise<User>
	 */
	destroy = (args: Prisma.UserDeleteArgs) => {
		return this.db.user.delete(args)
	}
}
