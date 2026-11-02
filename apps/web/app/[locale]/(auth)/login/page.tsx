'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'next/navigation'
import { Link, useRouter } from '@/lib/i18n/navigation'
import Cookies from 'js-cookie'
import { LoginSchema, type LoginInput } from '@propella/shared'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { AuthUser } from '@propella/shared'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const params = useParams()
  const currentLocale = (params.locale as string) ?? 'en'
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setAccessToken)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    try {
      const res = await api.post<{ data: { user: AuthUser; accessToken: string } }>('/auth/login', {
        email: data.email,
        password: data.password,
      })
      setToken(res.data.accessToken)
      setUser(res.data.user)

      const targetPath = !res.data.user.emailVerified
        ? `/verify-email?email=${encodeURIComponent(data.email)}`
        : !res.data.user.onboardingCompleted
        ? '/onboarding'
        : '/dashboard'

      const activeLocale = currentLocale || res.data.user.locale || 'en'
      Cookies.set('NEXT_LOCALE', activeLocale, { expires: 365, path: '/', sameSite: 'lax' })
      if (res.data.user.locale !== activeLocale) {
        api.patch('/users/me', { locale: activeLocale }).catch(() => null)
      }
      router.push(targetPath)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Invalid email or password')
    }
  }

  return (
    <div className="w-full">
      {/* Title & Subtitle matching reference */}
      <div className="mb-8">
        <h1
          className="text-[28px] sm:text-[34px] font-bold text-[var(--color-ink)] leading-[1.2] mb-2 tracking-tight"
          style={{ fontFamily: "'Parkinsans', sans-serif" }}
        >
          Welcome Back to Propella!
        </h1>
        <p className="text-[15px] text-[var(--color-ink-2)]">
          Sign in your account
        </p>
      </div>

      <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {/* Your Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-[13.5px] font-semibold text-[var(--color-ink)] mb-2"
          >
            Your Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="info.scholar@gmail.com"
            className={`w-full rounded-xl border bg-transparent dark:bg-[#1A1813] px-4 py-3.5 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 ${
              errors.email
                ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
                : 'border-[var(--color-rule-2)] hover:border-[var(--color-ink)]/40 focus:border-[var(--color-accent)]'
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[13.5px] font-semibold text-[var(--color-ink)] mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              className={`w-full rounded-xl border bg-transparent dark:bg-[#1A1813] px-4 py-3.5 pr-11 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 ${
                errors.password
                  ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
                  : 'border-[var(--color-rule-2)] hover:border-[var(--color-ink)]/40 focus:border-[var(--color-accent)]'
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] hover:text-[var(--color-ink)] p-1 transition-colors"
            >
              {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-[13.5px] pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--color-ink-2)] hover:text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-rule-2)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] accent-[var(--color-accent)] cursor-pointer"
            />
            <span>Remember Me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-[var(--color-ink-3)] hover:text-[var(--color-accent)] transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {serverError && (
          <div className="text-[13px] text-[var(--color-danger)] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
            {serverError}
          </div>
        )}

        {/* Big Dark Login Button matching reference */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white py-4 font-semibold text-[15.5px] tracking-wide transition-all duration-200 shadow-none hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      {/* Instant Login Divider */}
      <div className="my-7 flex items-center gap-3 select-none">
        <div className="flex-1 h-px bg-[var(--color-rule-2)]/60" />
        <span className="text-[12px] text-[var(--color-ink-3)] font-medium">Instant Login</span>
        <div className="flex-1 h-px bg-[var(--color-rule-2)]/60" />
      </div>

      {/* Social Login Button (Google) */}
      <div className="w-full">
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-[var(--color-rule-2)] bg-transparent dark:bg-[#1A1813] py-3.5 px-4 text-[14px] font-medium text-[var(--color-ink)]/70 cursor-not-allowed transition hover:border-[var(--color-rule)]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Bottom Switch Link matching reference */}
      <p className="mt-8 text-center text-[13.5px] text-[var(--color-ink-2)]">
        Don&apos;t have any account?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[var(--color-accent)] hover:underline underline-offset-4"
        >
          Register
        </Link>
      </p>
    </div>
  )
}
