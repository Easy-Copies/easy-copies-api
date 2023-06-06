// Types
import { IAppControllerConfigReturn } from '@/app/types/app-controller.type'

export interface IRegionControllerV1 {
	provinceList: IAppControllerConfigReturn
	regencyList: IAppControllerConfigReturn
	districtList: IAppControllerConfigReturn
}
