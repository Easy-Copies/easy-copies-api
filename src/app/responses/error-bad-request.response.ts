// Error
import { BaseResponse, ISerializeResponse } from './error-base.response'

class BadRequestResponse extends BaseResponse {
	statusCode = 400

	constructor(message?: string) {
		super(message)

		Object.setPrototypeOf(this, BadRequestResponse.prototype)
	}

	serializeResponse(): ISerializeResponse[] {
		return [{ message: this.message || 'Bad Request' }]
	}
}

export { BadRequestResponse }
