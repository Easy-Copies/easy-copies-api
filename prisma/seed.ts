// Colors
import colors from 'colors'
colors.enable()

// Prisma
import { PrismaClient } from '@prisma/client'

// Bcrypt
import bcrypt from 'bcryptjs'

// Init Prisma
const prisma = new PrismaClient()

const users = [
	{ name: 'Huda Prasetyo', email: 'test.hudaprasetyo@gmail.com' },
	{ name: 'Anisa Indriani', email: 'anisaindriani15@gmail.com' },
	{ name: 'Steven', email: 'stevengerrad57@gmail.com' }
]
const roles = [{ name: 'Admin' }, { name: 'Store' }, { name: 'Basic User' }]
const permissions = [{ code: 'User Management' }, { code: 'Role Management' }]

/**
 * @description Seed user
 *
 */
const userSeeder = async () => {
	const salt = await bcrypt.genSalt(10)
	const password = await bcrypt.hash('password', salt)

	await prisma.$transaction(
		users.map(({ email, name }) => {
			return prisma.user.upsert({
				where: { email },
				update: {},
				create: {
					name,
					email,
					password,
					isUserVerified: true
				}
			})
		})
	)
}

/**
 * @description Seed roles
 *
 */
const roleSeeder = async () => {
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

/**
 * @description Assign role to users
 *
 */
const assignRoleToUserSeeder = async () => {
	const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } })
	const selectedUsers = await prisma.user.findMany({
		where: {
			email: {
				in: users.map(user => user.email)
			}
		}
	})

	await prisma.$transaction(
		selectedUsers.map(user =>
			prisma.user.update({
				where: { id: user.id },
				data: {
					roles: {
						create: [
							{
								role: {
									connect: {
										id: adminRole?.id
									}
								}
							}
						]
					}
				}
			})
		)
	)
}

/**
 * @description Seed permissions
 *
 *
 */
const permissionSeeder = async () => {
	await prisma.$transaction([
		prisma.permission.createMany({
			data: permissions
		})
	])
}

/**
 * @description Assign permission to roles
 *
 *
 */
const assignRoleToPermissions = async () => {
	const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } })

	await prisma.$transaction(
		permissions.map(({ code }) =>
			prisma.role.update({
				where: { id: adminRole?.id },
				data: {
					permissions: {
						create: {
							permission: {
								connect: { code }
							},
							actions: {
								create: true,
								read: true,
								update: true,
								delete: true
							}
						}
					}
				}
			})
		)
	)
}

async function main() {
	await roleSeeder()
	await userSeeder()
	await assignRoleToUserSeeder()
	await permissionSeeder()
	await assignRoleToPermissions()
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
