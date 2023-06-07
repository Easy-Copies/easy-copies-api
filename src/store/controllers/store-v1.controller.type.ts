// Types
import { IAppControllerConfigRestrictionReturn } from '@/app/types/app-controller.type'

// Express Validator
import { ValidationChain } from 'express-validator'

export interface IStoreControllerV1 {
	createOrUpdateValidation: (isUpdate?: boolean) => ValidationChain[]
	index: IAppControllerConfigRestrictionReturn
	store: IAppControllerConfigRestrictionReturn
	show: IAppControllerConfigRestrictionReturn
	update: IAppControllerConfigRestrictionReturn
	destroy: IAppControllerConfigRestrictionReturn
}
