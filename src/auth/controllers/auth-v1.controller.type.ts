// Express
import { Request, Response } from 'express'

// Types
import { IAppControllerConfigReturn } from '@/app/types/app-controller.type'

export interface IAuthControllerV1 {
	login: IAppControllerConfigReturn
	register: (req: Request, res: Response) => any
	forgotPassword: (req: Request, res: Response) => any
	me: (req: Request, res: Response) => any
}
