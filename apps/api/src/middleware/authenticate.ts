import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthPayload } from '../types/express.js'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env['JWT_SECRET']

  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload
    req.auth = { sub: payload.sub, role: payload.role, email: payload.email }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
