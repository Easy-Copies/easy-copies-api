// Prisma
import { Prisma } from '@prisma/client'

export type TRoleModel = Prisma.RoleDelegate<
	Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>
