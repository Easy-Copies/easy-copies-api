export {}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string
			JWT_KEY: string
			DATABASE_URL: string
		}
	}
}
