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
import { ErrorNotFound } from '@/app/errors'

// Prisma
import { PrismaClient, TransactionApprovalStatus } from '@prisma/client'

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
			if (!status) _status = TransactionApprovalStatus.Done
			else _status = status as TransactionApprovalStatus

			// Check if user have authorization to approve
			const isUserHaveApprovalAuthorization =
				await transactionService.isUserHaveApprovalAuthorization(
					req.currentUser?.id as string
				)

			const transactionList = await prisma.transaction.findMany({
				...appCommonService.paginateArgs(req.query),
				where: {
					userId: isUserHaveApprovalAuthorization
						? undefined
						: (req.currentUser?.id as string),
					status: { equals: _status }
				}
			})
			const transactionListPaginated = appCommonService.paginate(
				{ result: transactionList, total: await prisma.transaction.count() },
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
			body('inkType').not().isEmpty().withMessage('Ink Type is required'),
			body('sheetLength')
				.not()
				.isEmpty()
				.isNumeric()
				.withMessage('Sheet Length should be numeric'),
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
			const { storeService, inkType, sheetLength, files } = req.body

			// Find store
			const storeDetail = await prisma.store.findFirst({
				where: { id: storeId },
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
			const { price: storePrice, pricePerSheet: storePricePerSheet } =
				storeServiceDetail

			// Create new transaction
			const createdTransaction = await prisma.transaction.create({
				data: {
					storeName,
					storePhoneNumber,
					storeEmail,
					storePrice,
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
					inkType,
					sheetLength,
					files,
					status: TransactionApprovalStatus.WaitingBeProcess,
					userId: req.currentUser?.id as string,
					transactionApprovals: {
						create: {
							status: TransactionApprovalStatus.WaitingBeProcess,
							statusDescription:
								transactionService.generateTransactionStatusApprovalDescription(
									TransactionApprovalStatus.WaitingBeProcess
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
}
