import type { UserRole } from '@app/shared'

export interface AuthPayload {
  sub: string
  role: UserRole
  email: string
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload
    }
  }
}
