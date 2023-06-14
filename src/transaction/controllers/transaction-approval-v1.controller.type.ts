// Types
import { IAppControllerConfigRestrictionReturn } from '@/app/types/app-controller.type'

export interface ITransactionApprovalControllerV1 {
	handle: IAppControllerConfigRestrictionReturn
	approvalStatusList: IAppControllerConfigRestrictionReturn
	cancel: IAppControllerConfigRestrictionReturn
}
