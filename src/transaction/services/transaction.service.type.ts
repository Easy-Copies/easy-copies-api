// Prisma
import { TransactionApprovalStatus } from '@prisma/client'

export type TTransactionServiceInclude = {
	index?: boolean
	show?: boolean
}

export type TTransactionService = {
	getCurrentStatusStoreApproval: (storeId: string) => Promise<string>
	isUserHaveApprovalAuthorization: (userId: string) => Promise<boolean>
	generateTransactionStatusApprovalDescription: (
		status: TransactionApprovalStatus
	) => string
}
