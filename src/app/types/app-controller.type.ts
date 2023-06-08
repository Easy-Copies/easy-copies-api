// Express
import { NextFunction, Request, Response } from 'express'

// Express Validator
import { ValidationChain } from 'express-validator'

// Types
import { EAppPermission, EAppPermissionActions } from './app-permission.type'

export interface IAppControllerConfigReturn {
	validateInput: ValidationChain[]
	config: (req: Request, res: Response, next?: NextFunction) => any
}

type PermissionRestriction = {
	permissionCode: EAppPermission
	permissionActions: EAppPermissionActions
}

export interface IAppControllerConfigRestrictionReturn
	extends IAppControllerConfigReturn {
	permission: PermissionRestriction
}
