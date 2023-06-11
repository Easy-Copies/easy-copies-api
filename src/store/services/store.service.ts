// Types
import { TStoreService } from './store.service.type'

// Express Validator
import { ValidationChain, body } from 'express-validator'

// Prisma
import { Prisma, PrismaClient, StoreApprovalStatus } from '@prisma/client'

// Errors
import { ErrorNotFound } from '@/app/errors'

// Types
import {
	EAppPermission,
	TPermissionActions
} from '@/app/types/app-permission.type'

// Init Prisma
const prisma = new PrismaClient()

export class StoreService implements TStoreService {
	/**
	 * @description Validation input
	 *
	 * @param {boolean} isCreate
	 *
	 * @return {ValidationChain[]} ValidationChain[]
	 *
	 */
	createOrUpdateValidation = (): ValidationChain[] => {
		return [
			body('name')
				.isLength({ min: 1, max: 60 })
				.withMessage('Name of store is required and maximum 60 characters'),
			body('description')
				.isLength({ max: 100 })
				.not()
				.isEmpty()
				.withMessage(
					'Description of store is required and maximum 100 characters'
				),
			body('phoneNumber')
				.isLength({ min: 8, max: 14 })
				.withMessage(
					'Phone Number of store is required and minimum 8 to 14 characters'
				),
			body('address')
				.isLength({ min: 1, max: 225 })
				.withMessage('Address of store is required and maximum 225 characters'),
			body('addressNote')
				.isLength({ max: 60 })
				.withMessage('Address Note of store has maximum of 60 characters'),
			body('provinceCode')
				.not()
				.isEmpty()
				.withMessage('Province of store is required'),
			body('regencyCode')
				.not()
				.isEmpty()
				.withMessage('Regency of store is required'),
			body('districtCode')
				.not()
				.isEmpty()
				.withMessage('District of store is required'),
			body('postalCode')
				.isLength({ min: 4, max: 5 })
				.withMessage('Postal Code is required and minimum 4 to 5 characters'),
			body('storePhoto').not().isEmpty().withMessage('Store Photo is required'),
			body('nik')
				.isLength({ min: 16, max: 16 })
				.withMessage('NIK is required and maximum 16 characters'),
			body('ktpPhoto').not().isEmpty().withMessage('Store Photo is required'),
			body('isOpen').not().isEmpty().withMessage('Is Open of store is required')
		]
	}

	/**
	 * @description Common include for store model
	 *
	 * @param {object} options
	 *
	 * @return {Prisma.StoreInclude} Prisma.StoreInclude
	 */
	commonStoreInclude = (): Prisma.StoreInclude => {
		return {
			province: true,
			district: true,
			regency: true,
			user: {
				select: {
					id: true,
					name: true
				}
			}
		}
	}

	/**
	 * @description Get current status store approval
	 *
	 * @param {string} storeId
	 *
	 * @return {Promise<string>} Promise<string>
	 */
	getCurrentStatusStoreApproval = async (
		storeId: string
	): Promise<StoreApprovalStatus> => {
		const store = await prisma.store.findFirst({
			where: { id: storeId },
			include: {
				storeApprovals: {
					take: 1,
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		})

		return store?.storeApprovals?.[0]?.status as StoreApprovalStatus
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
				permissionCode: EAppPermission.STORE_MANAGEMENT_APPROVAL
			}
		})

		if (!userRolePermission)
			throw new ErrorNotFound(`Role doesn't have that kind of permission`)

		const permissionActions = userRolePermission.actions as TPermissionActions

		return permissionActions.read && permissionActions.update
	}

	/**
	 * @description Generate store status approval description
	 *
	 * @param {StoreApprovalStatus} status
	 *
	 * @return {string} string
	 */
	generateStoreStatusApprovalDescription = (
		status: StoreApprovalStatus
	): string => {
		switch (status) {
			case StoreApprovalStatus.Pending:
				return 'Store waiting to be reviewed by Admin'
			case StoreApprovalStatus.Cancel:
				return 'Store has been cancel to be reviewed'
			case StoreApprovalStatus.OnReview:
				return 'Store currently on review by Admin'
			case StoreApprovalStatus.Rejected:
				return 'Store has been rejected by Admin'
			case StoreApprovalStatus.Revise:
				return 'Store has been revised, you should update the store by correct criteria'
			case StoreApprovalStatus.Revised:
				return 'Store has been revised, waiting Admin to be review again'
			case StoreApprovalStatus.Approved:
				return 'Store has been approved, enjoy your transaction'
			default:
				return ''
		}
	}
}
