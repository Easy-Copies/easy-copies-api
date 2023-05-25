export {}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string
			JWT_KEY: string
			JWT_REFRESH_KEY: string
			SMTP_TO_EMAIL: string
			SMTP_TO_PASSWORD: string
			DATABASE_URL: string
		}
	}
}
