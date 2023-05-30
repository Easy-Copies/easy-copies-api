// Prisma
import { PrismaClient } from '@prisma/client'

// Bcrypt
import bcrypt from 'bcryptjs'

// Init Prisma
const prisma = new PrismaClient()

/**
 * @description Seed user
 *
 */
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
					password,
					isUserVerified: true
				}
			})
		)
	)
}

/**
 * @description Seed roles
 *
 */
const roleSeeder = async () => {
	const roles = [{ name: 'Admin' }, { name: 'Store' }, { name: 'Basic User' }]

	await prisma.$transaction(
		roles.map(({ name }) =>
			prisma.role.upsert({
				where: { name },
				update: {},
				create: {
					name
				}
			})
		)
	)
}

async function main() {
	await Promise.all([userSeeder(), roleSeeder()])
}
main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.log(`===prisma/seed.ts===: ${e}`.red)
		await prisma.$disconnect()
		process.exit(1)
	})
