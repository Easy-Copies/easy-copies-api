// Client
import { PrismaClient } from '@prisma/client'

export interface IAppBaseService {
	db: PrismaClient
}
