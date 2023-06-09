// Error
import { ErrorBase, ISerializeErrorResponse } from './base.error'

// Express Validator
import { ValidationError as ExpressErrorValidation } from 'express-validator'

class ErrorValidation extends ErrorBase {
	statusCode = 422

	constructor(
		private errors: Omit<ExpressErrorValidation, 'location' | 'value'>[]
	) {
		super()

		Object.setPrototypeOf(this, ErrorValidation.prototype)
	}

	serializeErrors(): ISerializeErrorResponse[] {
		return this.errors.map(({ msg, param }) => ({
			message: msg,
			field: param
		}))
	}
}

export { ErrorValidation }
