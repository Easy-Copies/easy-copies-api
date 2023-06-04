// Types
import { IAppControllerConfigRestrictionReturn } from '@/app/types/app-controller.type'

export interface IRoleControllerV1 {
	index: IAppControllerConfigRestrictionReturn
	store: IAppControllerConfigRestrictionReturn
	show: IAppControllerConfigRestrictionReturn
	update: IAppControllerConfigRestrictionReturn
	destroy: IAppControllerConfigRestrictionReturn
	permissionList: IAppControllerConfigRestrictionReturn
	assignPermission: IAppControllerConfigRestrictionReturn
}
