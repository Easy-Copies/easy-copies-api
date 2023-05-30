// App
import { app } from './app'

// Prisma
import { PrismaClient } from '@prisma/client'

// Services
import { appNodeMailerWrapper } from './app/services/app-nodemailer-wrapper.service'

// PORT
const PORT = process.env.PORT || 5000

// Init prisma
const prisma = new PrismaClient()

const start = async () => {
	try {
		if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined!')
		if (!process.env.JWT_REFRESH_KEY)
			throw new Error('JWT_REFRESH_KEY is not defined!')
		if (!process.env.SMTP_TO_EMAIL)
			throw new Error('SMTP_TO_EMAIL is not defined!')
		if (!process.env.SMTP_TO_PASSWORD)
			throw new Error('SMTP_TO_PASSWORD is not defined!')
		if (!process.env.DATABASE_URL)
			throw new Error('DATABASE_URL is not defined!')

		// Check prisma connection
		await prisma.$connect()
		console.log('===app.ts===: Prisma ORM connected!'.green)

		// Run nodemailer
		appNodeMailerWrapper.connect()

		// Run the app
		app.listen(PORT, () => {
			console.log(`===app.ts===: Easy Copies API started at port ${PORT}`.green)
		})
	} catch (err) {
		console.log(`${err}`.red)
		await prisma.$disconnect()
	}
}

start()
