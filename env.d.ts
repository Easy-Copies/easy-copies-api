export {}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string
			JWT_KEY: string
			JWT_REFRESH_KEY: string
			DATABASE_URL: string
		}
	}
}
