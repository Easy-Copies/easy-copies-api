// Types
import { TTransactionService } from './transaction.service.type'

// Prisma
import { PrismaClient, TransactionApprovalStatus } from '@prisma/client'

// Errors
import { ErrorNotFound } from '@/app/errors'

// Types
import {
	EAppPermission,
	TPermissionActions
} from '@/app/types/app-permission.type'

// Init Prisma
const prisma = new PrismaClient()

export class TransactionService implements TTransactionService {
	/**
	 * @description Get current status transaction approval
	 *
	 * @param {string} transactionId
	 *
	 * @return {Promise<string>} Promise<string>
	 */
	getCurrentStatusTransactionApproval = async (
		transactionId: string
	): Promise<TransactionApprovalStatus> => {
		const store = await prisma.transaction.findFirst({
			where: { id: transactionId },
			include: {
				transactionApprovals: {
					take: 1,
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		})

		return store?.transactionApprovals?.[0]?.status as TransactionApprovalStatus
	}

	/**
	 * @description Get active role and permission for approval store
	 *
	 * @param {string} userId
	 *
	 * @return {Promise<boolean>} Promise<boolean>
	 */
	isUserHaveApprovalAuthorization = async (
		userId: string
	): Promise<boolean> => {
		// Get active role
		const userRole = await prisma.roleUser.findFirst({
			where: { userId, isActive: true }
		})

		if (!userRole) throw new ErrorNotFound('No Active Role')

		// Get permission by active role
		const userRolePermission = await prisma.permissionRole.findFirst({
			where: {
				roleId: userRole.roleId,
				permissionCode: EAppPermission.TRANSACTION_MANAGEMENT_APPROVAL
			}
		})

		if (!userRolePermission)
			throw new ErrorNotFound(`Role doesn't have that kind of permission`)

		const permissionActions = userRolePermission.actions as TPermissionActions

		return (
			permissionActions.read &&
			permissionActions.create &&
			permissionActions.update
		)
	}

	/**
	 * @description Generate transaction status approval description
	 *
	 * @param {TransactionApprovalStatus} status
	 *
	 * @return {string} string
	 */
	generateTransactionStatusApprovalDescription = (
		status: TransactionApprovalStatus
	): string => {
		switch (status) {
			case TransactionApprovalStatus.WaitingPayment:
				return 'Transaction awaiting payment'
			case TransactionApprovalStatus.WaitingConfirmation:
				return 'Transaction has been delivered to Admin, please wait'
			case TransactionApprovalStatus.OnProcess:
				return 'Transaction has been processed by Admin'
			case TransactionApprovalStatus.ReadyToPickup:
				return 'Transaction has been ready to get picked up'
			case TransactionApprovalStatus.Canceled:
				return 'Transaction has been canceled'
			case TransactionApprovalStatus.Rejected:
				return 'Transaction has been rejected by Admin'
			case TransactionApprovalStatus.Done:
				return 'Transaction has been done'
			default:
				return ''
		}
	}
}
