// Prisma Client
import { Prisma } from '@prisma/client'
import type { users } from '@prisma/client'

export interface IUserV1Service {
	index: (args?: Prisma.usersFindManyArgs) => Promise<users[]>
	store: (args: Prisma.usersCreateArgs) => Promise<users>
	show: (args: Prisma.usersFindFirstArgs) => Promise<users | null>
	update: (args: Prisma.usersUpdateArgs) => Promise<users>
	destroy: (args: Prisma.usersDeleteArgs) => Promise<users>
}
