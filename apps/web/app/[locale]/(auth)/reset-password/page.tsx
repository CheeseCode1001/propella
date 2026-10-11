'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { useState, Suspense } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'

const ResetFormSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  })

type ResetFormValues = z.infer<typeof ResetFormSchema>

function ResetPasswordForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(ResetFormSchema),
  })

  async function onSubmit(data: ResetFormValues) {
    setServerError(null)
    if (!token) {
      setServerError('This link is invalid or has expired. Request a new one.')
      return
    }
    try {
      await api.post('/auth/reset-password', { token, password: data.password })
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (!token) {
    return (
      <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-[var(--radius-md)] px-4 py-4 mb-6">
        <p className="text-[14px] text-[var(--color-danger)]">
          This reset link is invalid. Please request a new one.
        </p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-[var(--radius-md)] px-4 py-4 mb-6">
        <p className="text-[14px] text-[var(--color-ink)] leading-[1.5]">
          Password updated. Redirecting you to sign in.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div>
        <Label htmlFor="password">New password</Label>
        <div style={{ position: 'relative' }}>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
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

      <div>
        <Label htmlFor="confirm">{t('confirmPassword')}</Label>
        <Input
          id="confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />
        {errors.confirm && (
          <p className="mt-1.5 text-[13px] text-[var(--color-danger)]">{errors.confirm.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-[13px] text-[var(--color-danger)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-[var(--radius-sm)] px-3 py-2">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? `${t('resetPassword')}...` : t('resetPassword')}
      </Button>

      <p className="text-center text-[13px] text-[var(--color-ink-2)]">
        <Link
          href="/login"
          className="text-[var(--color-accent)] hover:underline underline-offset-[3px] decoration-[1px]"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  )
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
  return (
    <Card variant="elevated">
      <CardContent className="p-8">
        <div className="mb-6">
          <h1
            className="text-[22px] font-semibold text-[var(--color-ink)] leading-[1.3] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('resetPassword')}
          </h1>
          <p className="text-[13px] text-[var(--color-ink-2)]">
            Choose a password you have not used before.
          </p>
        </div>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </CardContent>
    </Card>
  )
}
