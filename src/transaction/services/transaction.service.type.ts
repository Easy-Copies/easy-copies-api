// Prisma
import { TransactionApprovalStatus } from '@prisma/client'

export type TTransactionServiceInclude = {
	index?: boolean
	show?: boolean
}

export type TTransactionService = {
	getCurrentStatusTransactionApproval: (
		transactionId: string
	) => Promise<TransactionApprovalStatus>
	isUserHaveApprovalAuthorization: (userId: string) => Promise<boolean>
	generateTransactionStatusApprovalDescription: (
		status: TransactionApprovalStatus
	) => string
}
