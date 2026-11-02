'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { useState, Suspense } from 'react'
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { api } from '@/lib/api-client'

const ResetFormSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
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
  const [showConfirm, setShowConfirm] = useState(false)

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
      setServerError('This link is invalid or has expired. Please request a new one.')
      return
    }
    try {
      await api.post('/auth/reset-password', { token, password: data.password })
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-4">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[13.5px] text-amber-900 dark:text-amber-200 leading-relaxed">
            This reset link is missing a valid token or has expired. Please request a fresh reset link.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="w-full inline-flex items-center justify-center rounded-xl bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] py-3.5 text-[15px] font-semibold transition hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white"
        >
          Request New Link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[13.5px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
            Your password has been successfully updated! Redirecting you to sign in...
          </p>
        </div>
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center rounded-xl bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] py-3.5 text-[15px] font-semibold transition hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white"
        >
          Sign in Now
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* New Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-[13.5px] font-semibold text-[var(--color-ink)] mb-2"
        >
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="At least 8 characters"
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

      {/* Confirm New Password */}
      <div>
        <label
          htmlFor="confirm"
          className="block text-[13.5px] font-semibold text-[var(--color-ink)] mb-2"
        >
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            className={`w-full rounded-xl border bg-transparent dark:bg-[#1A1813] px-4 py-3.5 pr-11 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 ${
              errors.confirm
                ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
                : 'border-[var(--color-rule-2)] hover:border-[var(--color-ink)]/40 focus:border-[var(--color-accent)]'
            }`}
            {...register('confirm')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] hover:text-[var(--color-ink)] p-1 transition-colors"
          >
            {showConfirm ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
        {errors.confirm && (
          <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{errors.confirm.message}</p>
        )}
      </div>

      {serverError && (
        <div className="text-[13px] text-[var(--color-danger)] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
          {serverError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white py-3.5 text-[15px] font-semibold transition-all duration-150 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Updating Password...' : 'Update Password'}
      </button>

      {/* Back to sign in */}
      <p className="text-center text-[14px] text-[var(--color-ink-2)] pt-2">
        <Link
          href="/login"
          className="font-semibold text-[var(--color-accent)] hover:underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full">
      {/* Title & Subtitle */}
      <div className="mb-8">
        <h1
          className="text-[28px] sm:text-[34px] font-bold text-[var(--color-ink)] leading-[1.2] mb-2 tracking-tight"
          style={{ fontFamily: "'Parkinsans', sans-serif" }}
        >
          Create New Password
        </h1>
        <p className="text-[15px] text-[var(--color-ink-2)]">
          Choose a secure password you have not used before
        </p>
      </div>

      <Suspense fallback={<div className="py-8 text-center text-[var(--color-ink-3)] text-sm">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
