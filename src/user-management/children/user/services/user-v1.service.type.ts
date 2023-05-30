// Prisma Client
import { Prisma } from '@prisma/client'
import type { User, PrismaPromise } from '@prisma/client'

export interface IUserV1Service {
	index: (args?: Prisma.UserFindManyArgs) => PrismaPromise<User[]>
	store: (args: Prisma.UserCreateArgs) => Prisma.Prisma__UserClient<User>
	show: (args: Prisma.UserFindFirstArgs) => PrismaPromise<User | null>
	update: (args: Prisma.UserUpdateArgs) => Prisma.Prisma__UserClient<User>
	destroy: (args: Prisma.UserDeleteArgs) => Prisma.Prisma__UserClient<User>
	destroyMany: (
		args: Prisma.UserDeleteManyArgs
	) => PrismaPromise<Prisma.BatchPayload>
}
