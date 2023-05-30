// Prisma Client
import { Prisma, PrismaPromise } from '@prisma/client'
import type { User } from '@prisma/client'

export interface IUserV1Service {
	index: (args?: Prisma.UserFindManyArgs) => PrismaPromise<User[]>
	store: (args: Prisma.UserCreateArgs) => Prisma.Prisma__UserClient<User>
	show: (args: Prisma.UserFindFirstArgs) => PrismaPromise<User | null>
	update: (
		args: Prisma.UserUpdateArgs
	) => Prisma.Prisma__UserClient<User | null>
	destroy: (args: Prisma.UserDeleteArgs) => Prisma.Prisma__UserClient<User>
}
