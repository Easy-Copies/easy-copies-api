// Types
import { IAppControllerConfigReturn } from '@/app/types/app-controller.type'

export interface IAuthControllerV1 {
	login: IAppControllerConfigReturn
	register: IAppControllerConfigReturn
	forgotPassword: IAppControllerConfigReturn
	me: IAppControllerConfigReturn['config']
	refreshToken: IAppControllerConfigReturn
	logout: IAppControllerConfigReturn['config']
}
