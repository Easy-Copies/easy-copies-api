// Jwt
import jwt from 'jsonwebtoken'

export type TAppJwtService = {
	generateToken: (
		payload: any,
		isRefresh: boolean,
		config?: jwt.SignOptions
	) => string
	verify: <T>(token: string, isRefresh: boolean) => Promise<T>
}
