// Colors
import colors from 'colors'
colors.enable()

// Prisma
import { PrismaClient } from '@prisma/client'

// Bcrypt
import bcrypt from 'bcryptjs'

// Seeder Data
import { provinces } from './seeders/seed-province'
import { regencies } from './seeders/seed-regency'
import { districts } from './seeders/seed-district'
import { users } from './seeders/seed-user'
import { roles } from './seeders/seed-role'
import { permissions } from './seeders/seed-permission'

// Init Prisma
const prisma = new PrismaClient()

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
	const userRole = await prisma.role.findFirst({ where: { name: 'User' } })
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
							},
							{
								role: {
									connect: {
										id: userRole?.id
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
	const userRole = await prisma.role.findFirst({ where: { name: 'User' } })

	await prisma.$transaction([
		// Assign to Admin Role
		...permissions.map(({ code }) =>
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
		),

		// Assign to User Role
		...permissions
			.filter(permission => permission.code === 'Store Management')
			.map(({ code }) =>
				prisma.role.update({
					where: { id: userRole?.id },
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
	])
}

/**
 * @description Seed indonesia regions
 *
 *
 */
const indonesiaRegionsSeeder = async () => {
	await prisma.$transaction([
		prisma.province.createMany({ data: provinces, skipDuplicates: true }),
		prisma.regency.createMany({ data: regencies, skipDuplicates: true }),
		prisma.district.createMany({ data: districts, skipDuplicates: true })
	])
}

async function main() {
	await roleSeeder()
	await userSeeder()
	await assignRoleToUserSeeder()
	await permissionSeeder()
	await assignRoleToPermissions()
	await indonesiaRegionsSeeder()
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
