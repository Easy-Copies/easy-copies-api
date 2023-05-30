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
	 */
	index = (args?: Prisma.UserFindManyArgs) => {
		return this.db.user.findMany(args)
	}

	/**
	 * @description store user
	 *
	 */
	store = (args: Prisma.UserCreateArgs) => {
		return this.db.user.create(args)
	}

	/**
	 * @description Get single user
	 *
	 */
	show = (args: Prisma.UserFindFirstArgs) => {
		return this.db.user.findFirst(args)
	}

	/**
	 * @description Update single user
	 *
	 */
	update = (args: Prisma.UserUpdateArgs) => {
		return this.db.user.update(args)
	}

	/**
	 * @description Destroy single user
	 *
	 */
	destroy = (args: Prisma.UserDeleteArgs) => {
		return this.db.user.delete(args)
	}

	/**
	 * @description Destroy multiple user
	 *
	 */
	destroyMany = (args: Prisma.UserDeleteManyArgs) => {
		return this.db.user.deleteMany(args)
	}
}
