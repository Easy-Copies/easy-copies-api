// Types
import { ITransactionControllerV1 } from './transaction-v1.controller.type'

// Services
import { AppCommonService } from '@/app/services/app-common.service'
import { TransactionService } from '@/transaction/services/transaction.service'

// Express
import { Request, Response } from 'express'

// Express Validator
import { body } from 'express-validator'

// Responses
import { SuccessOk, SuccessCreated } from '@/app/success/success'

// Errors
import { ErrorBadRequest, ErrorNotFound, ErrorValidation } from '@/app/errors'

// Prisma
import {
	PrismaClient,
	TransactionApprovalStatus,
	StoreServiceName,
	StoreApprovalStatus,
	InkType,
	PaperType,
	Prisma
} from '@prisma/client'

// Types
import {
	EAppPermission,
	EAppPermissionActions
} from '@/app/types/app-permission.type'

// Init Prisma
const prisma = new PrismaClient()

// Services
const appCommonService = new AppCommonService()
const transactionService = new TransactionService()

export class TransactionControllerV1 implements ITransactionControllerV1 {
	/**
	 * @description Get list of transactions
	 *
	 */
	index = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.TRANSACTION_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { status } = req.query
			let _status: TransactionApprovalStatus

			// Set default status
			if (!status) _status = TransactionApprovalStatus.WaitingPayment
			else _status = status as TransactionApprovalStatus

			// Check if status is mismatch from enum TransactionApprovalStatus
			if (!Object.values(TransactionApprovalStatus).includes(_status))
				throw new ErrorBadRequest('Transaction Status is invalid')

			// Check if user have authorization to approve
			const isUserHaveApprovalAuthorization =
				await transactionService.isUserHaveApprovalAuthorization(
					req.currentUser?.id as string
				)

			// Where clause for transaction
			const where: Prisma.TransactionFindManyArgs['where'] = {
				userId: isUserHaveApprovalAuthorization
					? undefined
					: (req.currentUser?.id as string),
				status: { equals: _status }
			}

			const transactionList = await prisma.transaction.findMany({
				...appCommonService.paginateArgs(req.query),
				where
			})
			const transactionListPaginated = appCommonService.paginate(
				{
					result: transactionList,
					total: await prisma.transaction.count({ where })
				},
				req.query
			)

			const { code, ...restResponse } = SuccessOk({
				result: transactionListPaginated
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Create new transaction
	 *
	 */
	store = {
		validateInput: [
			body('storeService')
				.not()
				.isEmpty()
				.withMessage('Store Service is required'),
			body('paperType').not().isEmpty().withMessage('Paper Type is required'),
			body('inkType').not().isEmpty().withMessage('Ink Type is required'),
			body('sheetLength')
				.not()
				.isEmpty()
				.isNumeric()
				.withMessage('Sheet Length should be numeric'),
			body('pickupDate').not().isEmpty().withMessage('Pickup Date is required'),
			body('responsiblePerson')
				.not()
				.isEmpty()
				.withMessage('Responsible Person is required'),
			body('files')
				.isArray()
				.withMessage('Files should be array')
				.custom(value => {
					if (value?.length === 0) throw new Error('Files is required')

					return true
				})
		],
		permission: {
			permissionCode: EAppPermission.TRANSACTION_MANAGEMENT,
			permissionActions: EAppPermissionActions.CREATE
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { storeId } = req.params
			const {
				storeService,
				paperType,
				inkType,
				sheetLength,
				pickupDate,
				responsiblePerson,
				files,
				description
			} = req.body

			// Find store
			const storeDetail = await prisma.store.findFirst({
				where: { id: storeId, status: StoreApprovalStatus.Approved },
				include: {
					province: true,
					regency: true,
					district: true
				}
			})
			if (!storeDetail) throw new ErrorNotFound('Store not found')

			// Find store service
			const storeServiceDetail = await prisma.storeService.findFirst({
				where: { storeId: storeDetail.id, name: storeService }
			})
			if (!storeServiceDetail)
				throw new ErrorNotFound(`Store service of ${storeService} not found`)

			// Check if storeService is mismatch from enum StoreServiceName
			if (!Object.values(StoreServiceName).includes(storeService))
				throw new ErrorValidation([
					{ msg: 'Store Service is invalid', param: 'storeService' }
				])

			// Check if inkType is mismatch from enum InkType
			if (!Object.values(InkType).includes(inkType))
				throw new ErrorValidation([
					{ msg: 'Ink Type is invalid', param: 'inkType' }
				])

			// Check if paperType is mismatch from enum PaperType
			if (!Object.values(PaperType).includes(paperType))
				throw new ErrorValidation([
					{ msg: 'Paper Type is invalid', param: 'paperType' }
				])

			// Destruct store
			const {
				name: storeName,
				phoneNumber: storePhoneNumber,
				email: storeEmail,
				address: storeAddress,
				addressNote: storeAddressNote,
				postalCode: storePostalCode,
				mapCoordinate: storeMapCoordinate,
				storeLogo,
				storePhoto
			} = storeDetail

			// Destruct store service
			const { pricePerSheet: storePricePerSheet } = storeServiceDetail

			// Create new transaction
			const createdTransaction = await prisma.transaction.create({
				data: {
					storeId: storeDetail.id,
					storeName,
					storePhoneNumber,
					storeEmail,
					storePricePerSheet,
					storeAddress,
					storeAddressNote,
					storeProvince: storeDetail.province,
					storeRegency: storeDetail.regency,
					storeDistrict: storeDetail.district,
					storePostalCode,
					storeMapCoordinate: storeMapCoordinate || undefined,
					storeLogo,
					storePhoto,
					storeServiceType: storeService,
					paperType,
					inkType,
					sheetLength,
					pickupDate,
					responsiblePerson,
					files,
					description,
					totalPrice: storePricePerSheet * sheetLength,
					status: TransactionApprovalStatus.WaitingPayment,
					userId: req.currentUser?.id as string,
					transactionApprovals: {
						create: {
							status: TransactionApprovalStatus.WaitingPayment,
							statusDescription:
								transactionService.generateTransactionStatusApprovalDescription(
									TransactionApprovalStatus.WaitingPayment
								),
							user: {
								connect: { id: req.currentUser?.id as string }
							}
						}
					}
				}
			})

			const { code, ...restResponse } = SuccessCreated({
				result: createdTransaction
			})
			return res.status(code).json(restResponse)
		}
	}

	/**
	 * @description Get single transaction
	 *
	 */
	show = {
		validateInput: [],
		permission: {
			permissionCode: EAppPermission.TRANSACTION_MANAGEMENT,
			permissionActions: EAppPermissionActions.READ
		},
		config: async (req: Request, res: Response) => {
			// Common State
			const { transactionId } = req.params

			// Find transaction
			const transactionDetail = await prisma.transaction.findFirst({
				where: { id: transactionId }
			})
			if (!transactionDetail) throw new ErrorNotFound('Transaction not found')

			// Check if user have authorization to approve
			const isUserHaveApprovalAuthorization =
				await transactionService.isUserHaveApprovalAuthorization(
					req.currentUser?.id as string
				)

			// Check if user want to check other user transaction
			// But, bypass if user is have authorization
			if (
				transactionDetail.userId !== (req.currentUser?.id as string) &&
				!isUserHaveApprovalAuthorization
			)
				throw new ErrorBadRequest('You cannot do this action')

			const { code, ...restResponse } = SuccessOk({
				result: transactionDetail
			})
			return res.status(code).json(restResponse)
		}
	}
}
