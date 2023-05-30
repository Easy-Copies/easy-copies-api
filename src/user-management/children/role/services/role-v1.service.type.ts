// Prisma Client
import { PrismaPromise } from '@prisma/client'
import type { Role, Prisma } from '@prisma/client'

export interface IRoleV1Service {
	model: Prisma.RoleDelegate<
		Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
	>
	index: (args?: Prisma.RoleFindManyArgs) => PrismaPromise<Role[]>
	store: (args: Prisma.RoleCreateArgs) => Prisma.Prisma__RoleClient<Role>
	show: (args: Prisma.RoleFindFirstArgs) => PrismaPromise<Role | null>
	update: (
		args: Prisma.RoleUpdateArgs
	) => Prisma.Prisma__RoleClient<Role | null>
	destroy: (args: Prisma.RoleDeleteArgs) => Prisma.Prisma__RoleClient<Role>
}
