// Types
import { TAppJwtService } from './app-jwt.service.type'

// JWT
import jwt from 'jsonwebtoken'

export class AppJwtService implements TAppJwtService {
	/**
	 * @description Generate JWT token
	 *
	 * @param {any} payload
	 * @param {boolean} isRefresh
	 * @param {jwt.SignOptions} config
	 *
	 * @return {string} token
	 */
	generateToken = (
		payload: any,
		isRefresh: boolean,
		config?: jwt.SignOptions
	): string => {
		return jwt.sign(
			payload,
			(isRefresh ? process.env.JWT_REFRESH_KEY : process.env.JWT_KEY) as string,
			{ ...config, expiresIn: config?.expiresIn || (isRefresh ? '10m' : 10) }
		)
	}

	/**
	 * @description Verify token
	 *
	 * @param {string} token
	 * @param {boolean} isRefresh
	 *
	 * @return {string} token
	 */
	verify = <T extends never>(token: string, isRefresh: boolean): Promise<T> => {
		return jwt.verify(
			token,
			(isRefresh ? process.env.JWT_REFRESH_KEY : process.env.JWT_KEY) as string
		) as T
	}
}
