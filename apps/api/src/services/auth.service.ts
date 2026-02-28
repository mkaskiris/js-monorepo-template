import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { eq, and, isNull, gt } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users, refreshTokens } from '../db/schema.js'
import type { RegisterInput, LoginInput } from '@app/shared'

const userColumns = {
  id: users.id,
  email: users.email,
  role: users.role,
}

export function httpError(message: string, status: number): Error {
  return Object.assign(new Error(message), { status })
}

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateAccessToken(userId: string, role: string, email: string): string {
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '15m') as jwt.SignOptions['expiresIn']
  return jwt.sign({ sub: userId, role, email }, getJwtSecret(), { expiresIn, algorithm: 'HS256' })
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(40).toString('hex')
  const tokenHash = hashToken(token)
  const days = Number.parseInt(process.env['REFRESH_TOKEN_EXPIRES_DAYS'] ?? '7', 10)
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  await db.insert(refreshTokens).values({ userId, tokenHash, expiresAt })
  return token
}

export async function register(input: RegisterInput) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)
  if (existing.length > 0) {
    throw httpError('Email already in use', 409)
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const [user] = await db
    .insert(users)
    .values({ email: input.email, passwordHash })
    .returning(userColumns)

  if (!user) throw new Error('Failed to create user')

  const accessToken = generateAccessToken(user.id, user.role, user.email)
  const refreshToken = await createRefreshToken(user.id)

  return { accessToken, refreshToken, user }
}

export async function login(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

  if (!user) {
    throw httpError('Invalid credentials', 401)
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) {
    throw httpError('Invalid credentials', 401)
  }

  const accessToken = generateAccessToken(user.id, user.role, user.email)
  const refreshToken = await createRefreshToken(user.id)

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  }
}

export async function refresh(rawToken: string) {
  const tokenHash = hashToken(rawToken)
  const now = new Date()

  const [token] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, now)
      )
    )
    .limit(1)

  if (!token) {
    throw httpError('Invalid or expired refresh token', 401)
  }

  const [user] = await db.select(userColumns).from(users).where(eq(users.id, token.userId)).limit(1)
  if (!user) {
    throw httpError('User not found', 401)
  }

  await db.update(refreshTokens).set({ revokedAt: now }).where(eq(refreshTokens.id, token.id))

  const newRefreshToken = await createRefreshToken(user.id)
  const accessToken = generateAccessToken(user.id, user.role, user.email)

  return { accessToken, refreshToken: newRefreshToken }
}

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken)
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash))
}

export async function getMe(userId: string) {
  const [user] = await db.select(userColumns).from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    throw httpError('User not found', 404)
  }
  return user
}
