// Types
import { IAppControllerConfigRestrictionReturn } from '@/app/types/app-controller.type'

export interface ITransactionControllerV1 {
	index: IAppControllerConfigRestrictionReturn
	store: IAppControllerConfigRestrictionReturn
	show: IAppControllerConfigRestrictionReturn
	pay: IAppControllerConfigRestrictionReturn
	paymentDetail: IAppControllerConfigRestrictionReturn
}
