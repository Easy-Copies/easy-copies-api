// Types
import { IRoleV1Service } from './role-v1.service.type'

// Prisma
import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'

export class RoleV1Service implements IRoleV1Service {
	constructor(private db: PrismaClient) {}

	model = this.db.role

	/**
	 * @description Get list of roles
	 *
	 * @param {Prisma.RoleFindManyArgs} args
	 *
	 */
	index = (args?: Prisma.RoleFindManyArgs) => {
		return this.model.findMany(args)
	}

	/**
	 * @description store role
	 *
	 * @param {Prisma.RoleCreateArgs} args
	 *
	 */
	store = (args: Prisma.RoleCreateArgs) => {
		return this.model.create(args)
	}

	/**
	 * @description Get single role
	 *
	 * @param {Prisma.RoleFindFirstArgs} args
	 *
	 */
	show = (args: Prisma.RoleFindFirstArgs) => {
		return this.model.findFirst(args)
	}

	/**
	 * @description Update single role
	 *
	 * @param {Prisma.RoleUpdateArgs} args
	 *
	 */
	update = (args: Prisma.RoleUpdateArgs) => {
		return this.model.update(args)
	}

	/**
	 * @description Destroy single role
	 *
	 * @param {Prisma.RoleDeleteArgs} args
	 *
	 */
	destroy = (args: Prisma.RoleDeleteArgs) => {
		return this.model.delete(args)
	}
}
