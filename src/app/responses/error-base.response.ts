interface ISerializeResponse {
	message: string
	field?: string
	result?: any
}

abstract class BaseResponse extends Error {
	abstract statusCode: number

	constructor(message?: string) {
		super(message)

		Object.setPrototypeOf(this, BaseResponse.prototype)
	}

	/**
	 * @description Serialize errors
	 *
	 */
	abstract serializeResponse(): ISerializeResponse[]
}

export { BaseResponse, ISerializeResponse }
