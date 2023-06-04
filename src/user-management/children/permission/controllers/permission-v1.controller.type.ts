// Types
import { IAppControllerConfigReturn } from '@/app/types/app-controller.type'

export interface IPermissionControllerV1 {
	index: IAppControllerConfigReturn['config']
	show: IAppControllerConfigReturn['config']
}
