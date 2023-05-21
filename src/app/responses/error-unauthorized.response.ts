// Error
import { BaseResponse, ISerializeResponse } from './error-base.response'

class UnauthorizedResponse extends BaseResponse {
	statusCode = 401

	constructor(message?: string) {
		super(message)

		Object.setPrototypeOf(this, UnauthorizedResponse.prototype)
	}

	serializeResponse(): ISerializeResponse[] {
		return [{ message: this.message || 'Unauthorized' }]
	}
}

export { UnauthorizedResponse }
