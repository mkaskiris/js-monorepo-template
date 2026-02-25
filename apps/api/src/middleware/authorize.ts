import type { Request, Response, NextFunction } from 'express'
import type { UserRole } from '@app/shared'

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}
