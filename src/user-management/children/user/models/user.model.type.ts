// Prisma
import { Prisma } from '@prisma/client'

export type TUserModel = Prisma.UserDelegate<
	Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>
