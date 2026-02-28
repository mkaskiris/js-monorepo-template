import { createContext, useEffect, useCallback, useMemo, useState, type ReactNode } from 'react'
import { apiClient, setAccessToken } from '../lib/apiClient.ts'
import type { AuthUser, LoginInput, RegisterInput } from '@app/shared'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiClient
      .post<{ accessToken: string }>('/auth/refresh')
      .then(({ accessToken }) => {
        setAccessToken(accessToken)
        return apiClient.get<{ user: AuthUser }>('/auth/me')
      })
      .then(({ user: u }) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (data: LoginInput) => {
    const res = await apiClient.post<{ accessToken: string; user: AuthUser }>('/auth/login', data)
    setAccessToken(res.accessToken)
    setUser(res.user)
  }, [])

  const register = useCallback(async (data: RegisterInput) => {
    const res = await apiClient.post<{ accessToken: string; user: AuthUser }>(
      '/auth/register',
      data
    )
    setAccessToken(res.accessToken)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    await apiClient.post('/auth/logout').catch(() => undefined)
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
