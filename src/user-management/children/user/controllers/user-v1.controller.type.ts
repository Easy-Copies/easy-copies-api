// Types
import { IAppControllerConfigReturn } from '@/app/types/app-controller.type'

// Prisma
import type { User } from '@prisma/client'

export interface IUserControllerV1 {
	_mapUser: (user: User) => Omit<User, 'password'>
	index: IAppControllerConfigReturn['config']
	store: IAppControllerConfigReturn
	show: IAppControllerConfigReturn['config']
	update: IAppControllerConfigReturn
	destroy: IAppControllerConfigReturn['config']
}
