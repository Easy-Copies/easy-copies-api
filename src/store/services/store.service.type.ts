// Express Validator
import { ValidationChain } from 'express-validator'

// Prisma
import { Prisma, StoreApprovalStatus } from '@prisma/client'

export type TStoreServiceInclude = {
	index?: boolean
	show?: boolean
}

export type TStoreService = {
	createOrUpdateValidation: (isCreate?: boolean) => ValidationChain[]
	commonStoreInclude: (options?: TStoreServiceInclude) => Prisma.StoreInclude
	getCurrentStatusStoreApproval: (storeId: string) => Promise<string>
	isUserHaveApprovalAuthorization: (userId: string) => Promise<boolean>
	generateStoreStatusApprovalDescription: (
		status: StoreApprovalStatus
	) => string
}
