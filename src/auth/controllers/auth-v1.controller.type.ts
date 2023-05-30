// Types
import { IAppControllerConfigReturn } from '@/app/types/app-controller.type'
import { EAppJwtServiceSignType } from '@/app/services/app-jwt.service.type'

// Prisma
import type { User, Token } from '@prisma/client'

export interface IAuthControllerV1 {
	_generateEmailWithVerificationCode: (
		signType: EAppJwtServiceSignType,
		user: User
	) => Promise<Token>
	login: IAppControllerConfigReturn
	register: IAppControllerConfigReturn
	forgotPassword: IAppControllerConfigReturn
	me: IAppControllerConfigReturn['config']
	refreshToken: IAppControllerConfigReturn
	logout: IAppControllerConfigReturn['config']
	verify: IAppControllerConfigReturn
}
