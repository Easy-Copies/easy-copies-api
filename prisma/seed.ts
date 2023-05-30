// Prisma
import { PrismaClient } from '@prisma/client'

// Bcrypt
import bcrypt from 'bcryptjs'

// Init Prisma
const prisma = new PrismaClient()

const userSeeder = async () => {
	const salt = await bcrypt.genSalt(10)
	const password = await bcrypt.hash('password', salt)

	const users = [
		{ name: 'Huda Prasetyo', email: 'test.hudaprasetyo@gmail.com' }
	]

	await prisma.$transaction(
		users.map(({ email, name }) =>
			prisma.user.upsert({
				where: { email: email },
				update: {},
				create: {
					name,
					email,
					password
				}
			})
		)
	)
}

async function main() {
	await userSeeder()
}
main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
