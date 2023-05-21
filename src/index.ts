// App
import { app } from './app'

// Prisma
import { PrismaClient } from '@prisma/client'

// PORT
const PORT = process.env.PORT || 5000

// Init prisma
const prisma = new PrismaClient()

const start = async () => {
	try {
		if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined!')
		if (!process.env.DATABASE_URL)
			throw new Error('DATABASE_URL is not defined!')

		await prisma.$connect()

		console.log('DATABASE: Prisma ORM connected!')

		// Run the app
		app.listen(PORT, () => {
			console.log(`Easy Copies API started at port ${PORT}`)
		})
	} catch (err) {
		console.error(err)
		await prisma.$disconnect()
	}
}

start()
