import { z } from 'zod'

export const SignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
})

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
})

export const VerifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
})

export type SignupInput = z.infer<typeof SignupSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
