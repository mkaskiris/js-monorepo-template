import { useAuth } from './useAuth.ts'
import type { UserRole } from '@app/shared'

export function useRole() {
  const { user } = useAuth()
  const role = user?.role

  return {
    role,
    isAdmin: role === 'admin',
    isUser: role === 'user',
    hasRole: (...roles: UserRole[]) => !!role && roles.includes(role),
  }
}
