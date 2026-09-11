'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Gift } from 'iconsax-reactjs'
import { useTranslations } from 'next-intl'
import { SignupSchema } from '@propella/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { AuthUser } from '@propella/shared'

const SignupFormSchema = SignupSchema.extend({
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms to continue' }),
  }),
})

type SignupFormValues = z.infer<typeof SignupFormSchema>

function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0
  if (password.length < 8) return 1
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  if (hasSpecial && (hasUpper || hasNumber)) return 4
  if (hasUpper && hasNumber) return 3
  if (hasUpper || hasNumber) return 2
  return 1
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  return (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3, 4].map((level) => (
        <div
          key={level}
          className="h-1 flex-1 rounded-full transition-colors duration-200"
          style={{
            backgroundColor:
              level <= strength
                ? 'var(--color-accent)'
                : 'var(--color-paper-3)',
          }}
        />
      ))}
    </div>
  )
}

export default function SignupPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setAccessToken)
  const [serverError, setServerError] = useState<string | null>(null)
  const [passwordValue, setPasswordValue] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
  })

  // Set when they arrived through an invite link (/signup?ref=CODE).
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')?.trim() ?? null

  async function onSubmit(data: SignupFormValues) {
    setServerError(null)
    try {
      const res = await api.post<{ data: { user: AuthUser; accessToken: string } }>('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
        // An unknown code is ignored server-side rather than failing sign-up.
        ...(referralCode ? { referralCode } : {}),
      })
      setToken(res.data.accessToken)
      setUser(res.data.user)
      // A six-digit code was emailed on signup; confirm it before onboarding.
      router.push(res.data.user.emailVerified ? '/onboarding' : '/verify-email')
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
            {t('signup')}
          </h1>
          <p className="text-[13px] text-[var(--color-ink-2)]">
            Five minutes to set up. Then we build your roadmap.
          </p>
        </div>

        {/* Confirms the invite was picked up, so it does not apply silently. */}
        {referralCode && (
          <div
            className="mb-5 flex items-start gap-2.5 rounded-[var(--radius-md)] px-3.5 py-3"
            style={{ backgroundColor: 'var(--color-accent-tint)' }}
          >
            <Gift
              size={17}
              color="var(--color-accent)"
              variant="Bold"
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <p className="text-[12.5px] leading-[1.55] text-[var(--color-ink-2)]">
              You were invited with code{' '}
              <strong className="text-[var(--color-ink)]">{referralCode.toUpperCase()}</strong>.
              Confirm your email after signing up and you both get AI credits.
            </p>
          </div>
        )}

        <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div>
            <Label htmlFor="name">{t('fullName')}</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              error={errors.name?.message}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1.5 text-[13px] text-[var(--color-danger)]">{errors.name.message}</p>
            )}
          </div>

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
            <Label htmlFor="password">Password</Label>
            <div style={{ position: 'relative' }}>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="pr-10"
                error={errors.password?.message}
                {...register('password', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordValue(e.target.value),
                })}
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
            <PasswordStrengthBar password={passwordValue} />
            {errors.password && (
              <p className="mt-1.5 text-[13px] text-[var(--color-danger)]">{errors.password.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-[var(--color-rule-2)] accent-[var(--color-accent)] cursor-pointer"
                {...register('terms')}
              />
              <label
                htmlFor="terms"
                className="text-[13px] text-[var(--color-ink-2)] leading-[1.5] cursor-pointer"
              >
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-[var(--color-accent)] hover:underline underline-offset-[3px] decoration-[1px]"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-[var(--color-accent)] hover:underline underline-offset-[3px] decoration-[1px]"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1.5 text-[13px] text-[var(--color-danger)]">{errors.terms.message}</p>
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
            {isSubmitting ? `${t('creatingAccount')}...` : t('signup')}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[var(--color-ink-2)]">
          {t('haveAccount')}{' '}
          <Link
            href="/login"
            className="text-[var(--color-accent)] hover:underline underline-offset-[3px] decoration-[1px]"
          >
            {t('login')}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
