// Services
import { AppBaseService } from '@/app/services/app-base.service'

// Types
import { IUserV1Service } from './user-v1.service.type'

// Prisma
import { Prisma } from '@prisma/client'
import type { users } from '@prisma/client'

export class UserV1Service extends AppBaseService implements IUserV1Service {
	/**
	 * @description Get list of users
	 *
	 * @param {Prisma.usersFindManyArgs} args
	 *
	 * @return {Promise<users>} Promise<users>
	 */
	index = (args?: Prisma.usersFindManyArgs): Promise<users[]> => {
		return this.db.users.findMany(args)
	}

	/**
	 * @description store user
	 *
	 * @param {Prisma.usersCreateArgs} args
	 *
	 * @return {Promise<users>} Promise<users>
	 */
	store = (args: Prisma.usersCreateArgs): Promise<users> => {
		return this.db.users.create(args)
	}

	/**
	 * @description Get single user
	 *
	 * @param {Prisma.usersFindFirstArgs} args
	 *
	 * @return {Promise<users>} Promise<users>
	 */
	show = (args: Prisma.usersFindFirstArgs): Promise<users | null> => {
		return this.db.users.findFirst(args)
	}

	/**
	 * @description Update single user
	 *
	 * @param {Prisma.usersUpdateArgs} args
	 *
	 * @return {Promise<users>} Promise<users>
	 */
	update = (args: Prisma.usersUpdateArgs): Promise<users> => {
		return this.db.users.update(args)
	}

	/**
	 * @description Destroy single user
	 *
	 * @param {Prisma.usersDeleteArgs} args
	 *
	 * @return {Promise<users>} Promise<users>
	 */
	destroy = (args: Prisma.usersDeleteArgs): Promise<users> => {
		return this.db.users.delete(args)
	}
}
