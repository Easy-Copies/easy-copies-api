// Types
import { IAppControllerConfigReturn } from '@/app/types/app-controller.type'

export interface IUserControllerV1 {
	index: IAppControllerConfigReturn['config']
	store: IAppControllerConfigReturn
	show: IAppControllerConfigReturn['config']
	update: IAppControllerConfigReturn
	destroy: IAppControllerConfigReturn['config']
}
