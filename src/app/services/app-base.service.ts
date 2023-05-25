// Types
import { IAppBaseService } from './app-base.service.type'

// Prisma Client
import { PrismaClient } from '@prisma/client'

// Init Prisma
const prisma = new PrismaClient()

export abstract class AppBaseService implements IAppBaseService {
	db: PrismaClient = prisma
}
