// Express
import { Response } from 'express'

type ISuccessData = { message?: string; result?: any }

export const ok = (res: Response, { message, result }: ISuccessData) => {
	return res
		.status(200)
		.json({ message: message || 'OK', result: result || null })
}
