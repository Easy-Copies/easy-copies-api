// Prisma Client
import { Prisma } from '@prisma/client'
import type { Token, PrismaPromise } from '@prisma/client'

export interface ITokenV1Service {
	index: (args?: Prisma.TokenFindManyArgs) => PrismaPromise<Token[]>
	store: (args: Prisma.TokenCreateArgs) => Prisma.Prisma__TokenClient<Token>
	show: (args: Prisma.TokenFindFirstArgs) => PrismaPromise<Token | null>
	update: (args: Prisma.TokenUpdateArgs) => Prisma.Prisma__TokenClient<Token>
	destroy: (args: Prisma.TokenDeleteArgs) => Prisma.Prisma__TokenClient<Token>
	destroyMany: (
		args: Prisma.TokenDeleteManyArgs
	) => PrismaPromise<Prisma.BatchPayload>
}
