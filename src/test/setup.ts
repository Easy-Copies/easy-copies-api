// JWT
import jwt from 'jsonwebtoken'

// Prisma Context
import { MockContext, Context, createMockContext } from './prisma-context'

// Crypto
import { randomUUID } from 'crypto'

declare global {
	// eslint-disable-next-line
	var logUserIn: () => string
}

let mockCtx: MockContext
let ctx: Context

// Set timeout of Jest
jest.setTimeout(60000)

beforeAll(async () => {
	// Set ENV for JWT
	process.env.JWT_KEY = 'asdf'
})

beforeEach(() => {
	mockCtx = createMockContext()
	ctx = mockCtx as unknown as Context
})

global.logUserIn = (): string => {
	return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY4NDcxYmUxLThiMTYtNDhkMy1iNTkxLTUxNGU3ZDFjY2QzMyIsImVtYWlsIjoidGVzdC5odWRhcHJhc2V0eW9AZ21haWwuY29tIiwiaWF0IjoxNjg3MTc4ODQ1LCJleHAiOjE2ODk3NzA4NDV9.Yb1YyQEe0oRbHxHRFn495gAugcbYw-Juj2daIrtoOYA'
}
