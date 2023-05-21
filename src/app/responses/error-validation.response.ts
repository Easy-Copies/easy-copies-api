// Error
import { BaseResponse, ISerializeResponse } from './error-base.response'

// Express Validator
import { ValidationError as ExpressValidationResponse } from 'express-validator'

class ValidationResponse extends BaseResponse {
	statusCode = 422

	constructor(private errors: ExpressValidationResponse[]) {
		super()

		Object.setPrototypeOf(this, ValidationResponse.prototype)
	}

	serializeResponse(): ISerializeResponse[] {
		return this.errors.map(({ msg }) => ({
			message: msg
		}))
	}
}

export { ValidationResponse }
