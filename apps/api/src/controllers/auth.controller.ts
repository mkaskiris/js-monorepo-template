import type { Request, Response } from 'express'
import * as authService from '../services/auth.service.js'

const REFRESH_COOKIE = 'refreshToken'

function getRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE]
}

function setRefreshCookie(res: Response, token: string): void {
  const days = Number.parseInt(process.env['REFRESH_TOKEN_EXPIRES_DAYS'] ?? '7', 10)
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    maxAge: days * 24 * 60 * 60 * 1000,
    path: '/auth',
  })
}

// Express 5 automatically forwards thrown errors to the error handler
export async function register(req: Request, res: Response): Promise<void> {
  const user = await authService.register(req.body)
  res.status(201).json({ user })
}

export async function login(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, user } = await authService.login(req.body)
  setRefreshCookie(res, refreshToken)
  res.json({ accessToken, user })
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const rawToken = getRefreshCookie(req)
  if (!rawToken) {
    res.status(401).json({ error: 'No refresh token' })
    return
  }
  const { accessToken, refreshToken } = await authService.refresh(rawToken)
  setRefreshCookie(res, refreshToken)
  res.json({ accessToken })
}

export async function logout(req: Request, res: Response): Promise<void> {
  const rawToken = getRefreshCookie(req)
  if (rawToken) {
    await authService.logout(rawToken).catch(() => undefined)
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' })
  res.status(204).send()
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getMe(req.auth!.sub)
  res.json({ user })
}
