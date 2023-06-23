// Logger
import { appLogger } from '../src/app/logger/app-logger'

// Prisma
import {
	PrismaClient,
	Store,
	StoreApprovalStatus,
	StoreServiceName,
	User
} from '@prisma/client'

// Bcrypt
import bcrypt from 'bcryptjs'

// Seeder Data
import { provinces } from './seeders/seed-province'
import { regencies } from './seeders/seed-regency'
import { districts } from './seeders/seed-district'
import { users } from './seeders/seed-user'
import { roles } from './seeders/seed-role'
import { permissions } from './seeders/seed-permission'
import { store, storeThree, storeTwo } from './seeders/seed-store'

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
			data: permissions,
			skipDuplicates: true
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

/**
 * @description seed store
 *
 *
 */
const storeSeeder = async () => {
	const hudaUser = (await prisma.user.findFirst({
		where: { name: 'Huda Prasetyo' }
	})) as User

	return prisma.$transaction([
		prisma.store.create({
			data: {
				...store,
				userId: hudaUser.id as string,
				email: hudaUser.email as string,
				status: StoreApprovalStatus.Approved,
				storeApprovals: {
					create: {
						status: StoreApprovalStatus.Approved,
						statusDescription: 'Already Approved',
						user: {
							connect: {
								id: hudaUser.id as string
							}
						}
					}
				}
			}
		}),
		prisma.store.create({
			data: {
				...storeTwo,
				userId: hudaUser.id as string,
				email: hudaUser.email as string,
				status: StoreApprovalStatus.Approved,
				storeApprovals: {
					create: {
						status: StoreApprovalStatus.Approved,
						statusDescription: 'Already Approved',
						user: {
							connect: {
								id: hudaUser.id as string
							}
						}
					}
				}
			}
		}),
		prisma.store.create({
			data: {
				...storeThree,
				userId: hudaUser.id as string,
				email: hudaUser.email as string,
				status: StoreApprovalStatus.Approved,
				storeApprovals: {
					create: {
						status: StoreApprovalStatus.Approved,
						statusDescription: 'Already Approved',
						user: {
							connect: {
								id: hudaUser.id as string
							}
						}
					}
				}
			}
		})
	])
}

/**
 * @description Store service seeder
 *
 *
 */
const storeServiceSeeder = async () => {
	const hudaUser = (await prisma.user.findFirst({
		where: { name: 'Huda Prasetyo' }
	})) as User
	const store = (await prisma.store.findFirst({
		where: { userId: hudaUser.id }
	})) as Store

	return prisma.$transaction([
		prisma.storeService.create({
			data: {
				name: StoreServiceName.Laminating,
				pricePerSheet: 1000,
				storeId: store.id
			}
		}),
		prisma.storeService.create({
			data: {
				name: StoreServiceName.Printing,
				pricePerSheet: 800,
				storeId: store.id
			}
		}),
		prisma.storeService.create({
			data: {
				name: StoreServiceName.Jilid,
				pricePerSheet: 4000,
				storeId: store.id
			}
		}),
		prisma.storeService.create({
			data: {
				name: StoreServiceName.Fotocopy,
				pricePerSheet: 500,
				storeId: store.id
			}
		})
	])
}

async function main() {
	await roleSeeder()
	await userSeeder()
	await assignRoleToUserSeeder()
	await permissionSeeder()
	await assignRoleToPermissions()
	await indonesiaRegionsSeeder()
	await storeSeeder()
	await storeServiceSeeder()
}
main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		appLogger.error(`===prisma/seed.ts===:`, e)
		await prisma.$disconnect()
		process.exit(1)
	})
