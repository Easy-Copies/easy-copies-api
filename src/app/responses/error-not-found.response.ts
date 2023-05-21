// Error
import { BaseResponse, ISerializeResponse } from './error-base.response'

class NotFoundResponse extends BaseResponse {
	statusCode = 404

	constructor(message?: string) {
		super(message)

		Object.setPrototypeOf(this, NotFoundResponse.prototype)
	}

	serializeResponse(): ISerializeResponse[] {
		return [{ message: this.message || 'Not Found' }]
	}
}

export { NotFoundResponse }
