// Supertest
import request from 'supertest'

// App
import { app } from '@/app'

describe('index', () => {
	it('should be return 401 when user not authenticated', async () => {
		return request(app)
			.get('/api/v1/user-management/roles')
			.send({})
			.expect(401)
	})

	it('should be return 200 when user is authenticated', async () => {
		return request(app)
			.get('/api/v1/user-management/roles')
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.send({})
	})
})

describe('store', () => {
	it('when user is unauthenticated will return 401', async () => {
		return request(app)
			.post('/api/v1/user-management/roles')
			.send({})
			.expect(401)
	})

	it('will return 422 when form not match', async () => {
		return request(app)
			.post('/api/v1/user-management/roles')
			.send({ randomPayload: 'Name' })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(422)
	})

	it('will return 400 when role already exists', async () => {
		// Create new role
		const createdRole = await request(app)
			.post('/api/v1/user-management/roles')
			.send({ name: `Test ${Math.random()}` })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(201)

		await request(app)
			.post('/api/v1/user-management/roles')
			.send({ name: createdRole.body.result.name })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(400)
	})

	it('will return 201 when successfully create', async () => {
		return request(app)
			.post('/api/v1/user-management/roles')
			.send({ name: `Test ${Math.random()}` })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(201)
	})
})

describe('show', () => {
	it('will return 401 when user unauthenticated', async () => {
		return request(app)
			.get('/api/v1/user-management/roles/asdasd')
			.send({})
			.expect(401)
	})

	it('will return 404 when no role found', async () => {
		return request(app)
			.get(`/api/v1/user-management/roles/asdasdad`)
			.send({})
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(404)
	})

	it('will return 200 any role is found', async () => {
		// Create new role first
		const createdRole = await request(app)
			.post('/api/v1/user-management/roles')
			.send({ name: `Test ${Math.random()}` })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(201)

		// Find new created role
		const findNewCreatedRole = await request(app)
			.get(`/api/v1/user-management/roles/${createdRole.body.result.id}`)
			.send({})
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(200)

		expect(findNewCreatedRole.body.result.name).toBe(
			createdRole.body.result.name
		)
	})
})

describe('update', () => {
	it('will return 401 when user unauthenticated', async () => {
		return request(app)
			.put('/api/v1/user-management/roles/asdasd')
			.send({})
			.expect(401)
	})

	it('will return 422 when invalid payload sent', async () => {
		return request(app)
			.put(`/api/v1/user-management/roles/asdasdad`)
			.send({ randomPayload: 'Name' })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(422)
	})

	it('will return 400 when role already exists', async () => {
		// Create new role
		const createdRole = await request(app)
			.post('/api/v1/user-management/roles')
			.send({ name: `Test ${Math.random()}` })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(201)

		await request(app)
			.put(`/api/v1/user-management/roles/${createdRole.body.result.id}`)
			.send({ name: 'Admin' })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(400)
	})

	it('will return 200 when successfully updated', async () => {
		// Create new role first
		const createdRole = await request(app)
			.post('/api/v1/user-management/roles')
			.send({ name: `Test ${Math.random()}` })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(201)

		return request(app)
			.put(`/api/v1/user-management/roles/${createdRole.body.result.id}`)
			.send({ name: `Updated ${Math.random()} ` })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(200)
	})
})

describe('destroy', () => {
	it('will return 401 when user unauthenticated', async () => {
		return request(app)
			.delete('/api/v1/user-management/roles/asdasd')
			.send({})
			.expect(401)
	})

	it('will return 404 when no role match', async () => {
		return request(app)
			.delete('/api/v1/user-management/roles/asdasd')
			.send({})
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(404)
	})

	it('will return 200 when role match', async () => {
		// Create new role first
		const createdRole = await request(app)
			.post('/api/v1/user-management/roles')
			.send({ name: `Test ${Math.random()}` })
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(201)

		// Delete new created role
		await request(app)
			.delete(`/api/v1/user-management/roles/${createdRole.body.result.id}`)
			.send({})
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(200)

		// Will return 404 when user trying to find deleted role
		await request(app)
			.get(`/api/v1/user-management/roles/${createdRole.body.result.id}`)
			.send({})
			.set('Authorization', `Bearer ${global.logUserIn()}`)
			.expect(404)
	})
})

describe('role permission', () => {
	describe('permissionList', () => {
		it('will return 401 when user unauthenticated', async () => {
			return request(app)
				.get('/api/v1/user-management/roles/permissions/asdasdad')
				.send({})
				.expect(401)
		})

		it('will return 404 when role not found', async () => {
			return request(app)
				.get('/api/v1/user-management/roles/permissions/asdasdad')
				.send({})
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(404)
		})

		it('Will return 200 when role found', async () => {
			// Create new role first
			const createdRole = await request(app)
				.post('/api/v1/user-management/roles')
				.send({ name: `Test ${Math.random()}` })
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(201)

			await request(app)
				.get(`/api/v1/user-management/roles/${createdRole.body.result.id}`)
				.send({})
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(200)
		})
	})

	describe('assignPermission', () => {
		it('will return 401 when user unauthenticated', async () => {
			return request(app)
				.put('/api/v1/user-management/roles/permissions/assign/asdasd')
				.send({})
				.expect(401)
		})

		it('will return 422 when form not match', async () => {
			await request(app)
				.put(`/api/v1/user-management/roles/permissions/assign/asdasdsad`)
				.send({
					permissionCodeee: 'Role Management',
					actionss: {
						create: true,
						read: true,
						update: true,
						delete: true
					}
				})
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(422)
		})

		describe('permission.actions', () => {
			it('will return 422 when form actions.create not match', async () => {
				await request(app)
					.put(`/api/v1/user-management/roles/permissions/assign/asdasdsad`)
					.send({
						permissionCode: 'Role Management',
						actions: {
							create: 'true'
						}
					})
					.set('Authorization', `Bearer ${global.logUserIn()}`)
					.expect(422)
			})

			it('will return 422 when form actions.read not match', async () => {
				await request(app)
					.put(`/api/v1/user-management/roles/permissions/assign/asdasdsad`)
					.send({
						permissionCode: 'Role Management',
						actions: {
							create: true,
							read: 'true',
							update: true,
							delete: true
						}
					})
					.set('Authorization', `Bearer ${global.logUserIn()}`)
					.expect(422)
			})

			it('will return 422 when form actions.update not match', async () => {
				await request(app)
					.put(`/api/v1/user-management/roles/permissions/assign/asdasdsad`)
					.send({
						permissionCode: 'Role Management',
						actions: {
							create: true,
							read: true,
							update: 'true',
							delete: true
						}
					})
					.set('Authorization', `Bearer ${global.logUserIn()}`)
					.expect(422)
			})

			it('will return 422 when form actions.delete not match', async () => {
				await request(app)
					.put(`/api/v1/user-management/roles/permissions/assign/asdasdsad`)
					.send({
						permissionCode: 'Role Management',
						actions: {
							create: true,
							read: true,
							update: true,
							delete: 'true'
						}
					})
					.set('Authorization', `Bearer ${global.logUserIn()}`)
					.expect(422)
			})
		})

		it('will return 404 when role not found', () => {
			return request(app)
				.put('/api/v1/user-management/roles/permissions/assign/asdasdad')
				.send({
					permissionCode: 'Role Management',
					actions: {
						create: true,
						read: true,
						update: true,
						delete: true
					}
				})
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(404)
		})

		it('will return 404 when permission not found', async () => {
			// Create new role first
			const createdRole = await request(app)
				.post('/api/v1/user-management/roles')
				.send({ name: `Test ${Math.random()}` })
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(201)

			return request(app)
				.put(
					`/api/v1/user-management/roles/permissions/assign/${createdRole.body.result.id}`
				)
				.send({
					permissionCode: 'Role Managementttt',
					actions: {
						create: true,
						read: true,
						update: true,
						delete: true
					}
				})
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(404)
		})

		it('will return 200 when permission assigned to role', async () => {
			// Create new role first
			const createdRole = await request(app)
				.post('/api/v1/user-management/roles')
				.send({ name: `Test ${Math.random()}` })
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(201)

			return request(app)
				.put(
					`/api/v1/user-management/roles/permissions/assign/${createdRole.body.result.id}`
				)
				.send({
					permissionCode: 'Role Management',
					actions: {
						create: true,
						read: true,
						update: true,
						delete: true
					}
				})
				.set('Authorization', `Bearer ${global.logUserIn()}`)
				.expect(200)
		})
	})
})
