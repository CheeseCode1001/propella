'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@/lib/i18n/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@propella/shared'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api-client'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError(null)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSubmitted(true)
    } catch {
      // Show generic success message regardless to prevent email enumeration
      setSubmitted(true)
    }
  }

  return (
    <div className="w-full">
      {/* Title & Subtitle matching the new auth aesthetic */}
      <div className="mb-8">
        <h1
          className="text-[28px] sm:text-[34px] font-bold text-[var(--color-ink)] leading-[1.2] mb-2 tracking-tight"
          style={{ fontFamily: "'Parkinsans', sans-serif" }}
        >
          Reset Your Password
        </h1>
        <p className="text-[15px] text-[var(--color-ink-2)]">
          Enter your registered email and we&apos;ll send you a recovery link
        </p>
      </div>

      {submitted ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4 sm:p-5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[15px] font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                Recovery Link Sent
              </h3>
              <p className="text-[13.5px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                If an account exists for that email, a password reset link has been dispatched. Please check your inbox and spam folder.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white py-3.5 text-[15px] font-semibold transition-all duration-150 active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            Return to Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          {/* Your Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-[13.5px] font-semibold text-[var(--color-ink)] mb-2"
            >
              Your Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="info.scholar@gmail.com"
                className={`w-full rounded-xl border bg-transparent dark:bg-[#1A1813] px-4 py-3.5 pr-11 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 ${
                  errors.email
                    ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
                    : 'border-[var(--color-rule-2)] hover:border-[var(--color-ink)]/40 focus:border-[var(--color-accent)]'
                }`}
                {...register('email')}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)] pointer-events-none p-1">
                <Mail size={18} strokeWidth={1.75} />
              </div>
            </div>
            {errors.email && (
              <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{errors.email.message}</p>
            )}
          </div>

          {serverError && (
            <div className="text-[13px] text-[var(--color-danger)] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
              {serverError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white py-3.5 text-[15px] font-semibold transition-all duration-150 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
          </button>

          {/* Bottom link */}
          <p className="text-center text-[14px] text-[var(--color-ink-2)] pt-2">
            Remembered your password?{' '}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-accent)] hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
