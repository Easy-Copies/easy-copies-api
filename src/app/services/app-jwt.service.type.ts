// Jwt
import jwt from 'jsonwebtoken'

export enum EAppJwtServiceSignType {
	LOGIN = 'Login',
	REFRESH_TOKEN = 'RefreshToken',
	FORGOT_PASSWORD = 'ForgotPassword',
	VERIFY_USER = 'VerifyUser'
}

export type TAppJwtServiceGenerateJwtSignKey = {
	jwtSignKey: string
	expiresIn: number | string
}

export type TAppJwtService = {
	_generateJwtSignKey: (
		signType: EAppJwtServiceSignType
	) => TAppJwtServiceGenerateJwtSignKey
	generateToken: (
		payload: any,
		signType: EAppJwtServiceSignType,
		config?: jwt.SignOptions
	) => string
	verify: <T>(token: string, signType: EAppJwtServiceSignType) => Promise<T>
}
