'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'next/navigation'
import { Link, useRouter } from '@/lib/i18n/navigation'
import Cookies from 'js-cookie'
import { LoginSchema, type LoginInput } from '@propella/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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

      const userLocale = res.data.user.locale ?? 'en'
      if (userLocale !== currentLocale) {
        Cookies.set('NEXT_LOCALE', userLocale, { expires: 365, path: '/', sameSite: 'lax' })
        router.replace(targetPath, { locale: userLocale })
      } else {
        router.push(targetPath)
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <Card variant="elevated">
      <CardContent className="p-8">
        <div className="mb-6">
          <h1
            className="text-[22px] font-semibold text-[var(--color-ink)] leading-[1.3] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('login')}
          </h1>
          <p className="text-[13px] text-[var(--color-ink-2)]">Welcome back.</p>
        </div>

        <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1.5 text-[13px] text-[var(--color-danger)]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password" className="mb-0">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[13px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pr-10"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--color-ink-3)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-[13px] text-[var(--color-danger)]">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-[13px] text-[var(--color-danger)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-[var(--radius-sm)] px-3 py-2">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? `${t('signingIn')}...` : t('login')}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-rule)]" />
          <span className="text-[12px] text-[var(--color-ink-3)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-rule)]" />
        </div>

        <div>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full opacity-50 cursor-not-allowed"
            disabled
          >
            Sign in with Google
          </Button>
          <p className="mt-2 text-center text-[12px] text-[var(--color-ink-3)]">
            Google sign-in coming soon
          </p>
        </div>

        <p className="mt-6 text-center text-[13px] text-[var(--color-ink-2)]">
          New to Propella?{' '}
          <Link
            href="/signup"
            className="text-[var(--color-accent)] hover:underline underline-offset-[3px] decoration-[1px]"
          >
            {t('signup')}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
