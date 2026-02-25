import { z } from 'zod'

export const userRoleSchema = z.enum(['admin', 'user'])
export type UserRole = z.infer<typeof userRoleSchema>

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: userRoleSchema,
})

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: AuthUserSchema,
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
