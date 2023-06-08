// Types
import { IAppControllerConfigRestrictionReturn } from '@/app/types/app-controller.type'

export interface IStoreControllerV1 {
	index: IAppControllerConfigRestrictionReturn
	store: IAppControllerConfigRestrictionReturn
	show: IAppControllerConfigRestrictionReturn
	update: IAppControllerConfigRestrictionReturn
	destroy: IAppControllerConfigRestrictionReturn
	cancelStore: IAppControllerConfigRestrictionReturn
}
