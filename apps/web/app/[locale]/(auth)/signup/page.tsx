'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Gift } from 'iconsax-reactjs'
import { useTranslations } from 'next-intl'
import { SignupSchema } from '@propella/shared'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'

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
    <div className="flex gap-1.5 mt-2">
      {[1, 2, 3, 4].map((level) => (
        <div
          key={level}
          className="h-1 flex-1 rounded-full transition-colors duration-200"
          style={{
            backgroundColor:
              level <= strength
                ? 'var(--color-accent)'
                : 'var(--color-rule-2)',
          }}
        />
      ))}
    </div>
  )
}

export default function SignupPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const [serverError, setServerError] = useState<string | null>(null)
  const [passwordValue, setPasswordValue] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Clear any old/stale session on mount so that the signup and verification flow starts fresh
  useEffect(() => {
    logout()
  }, [logout])

  const searchParamsRef = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref')?.trim() : ''
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      referralCode: searchParamsRef || '',
    },
  })
  const activeReferralCode = watch('referralCode') || searchParamsRef

  // Set when they arrived through an invite link (/signup?ref=CODE).
  const searchParams = useSearchParams()
  const initialRef = searchParams.get('ref')?.trim() ?? ''

  async function onSubmit(data: SignupFormValues) {
    setServerError(null)
    const code = (data.referralCode || initialRef || '').trim()
    try {
      logout()

      await api.post<{ data: { pendingVerification: boolean; email: string } }>('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
        ...(code ? { referralCode: code } : {}),
      })
      router.push('/verify-email?email=' + encodeURIComponent(data.email))
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong during signup')
    }
  }

  return (
    <div className="w-full">
      {/* Title & Subtitle */}
      <div className="mb-7">
        <h1
          className="text-[28px] sm:text-[34px] font-bold text-[var(--color-ink)] leading-[1.2] mb-2 tracking-tight"
          style={{ fontFamily: "'Parkinsans', sans-serif" }}
        >
          Create Your Account
        </h1>
        <p className="text-[15px] text-[var(--color-ink-2)]">
          Join thousands of Nigerian scholars acing their exams
        </p>
      </div>

      {/* Confirms the invite was picked up */}
      {activeReferralCode && (
        <div
          className="mb-5 flex items-start gap-2.5 rounded-xl px-3.5 py-3 border border-[var(--color-accent)]/20"
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
            <strong className="text-[var(--color-ink)]">{activeReferralCode.toUpperCase()}</strong>.
            Confirm your email after signing up to unlock AI bonus study credits!
          </p>
        </div>
      )}

      <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4.5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-[13.5px] font-semibold text-[var(--color-ink)] mb-1.5"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Chinedu Okafor"
            className={`w-full rounded-xl border bg-transparent dark:bg-[#1A1813] px-4 py-3.5 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 ${
              errors.name
                ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
                : 'border-[var(--color-rule-2)] hover:border-[var(--color-ink)]/40 focus:border-[var(--color-accent)]'
            }`}
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-[13.5px] font-semibold text-[var(--color-ink)] mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="chinedu@example.com"
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

        {/* Password with Strength Bar */}
        <div>
          <label
            htmlFor="password"
            className="block text-[13.5px] font-semibold text-[var(--color-ink)] mb-1.5"
          >
            Password
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
              {...register('password', {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordValue(e.target.value),
              })}
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
          <PasswordStrengthBar password={passwordValue} />
          {errors.password && (
            <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{errors.password.message}</p>
          )}
        </div>

        {/* Referral Code (Optional) */}
        <div>
          <label htmlFor="referralCode" className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)] mb-1.5">
            <Gift size={14} color="var(--color-accent)" variant="Linear" />
            <span>Referral Code</span>
            <span className="text-[12px] font-normal text-[var(--color-ink-3)]">(Optional)</span>
          </label>
          <input
            id="referralCode"
            type="text"
            autoCapitalize="characters"
            placeholder="e.g. PROP-AB12"
            className="w-full rounded-xl border border-[var(--color-rule-2)] bg-transparent dark:bg-[#1A1813] px-4 py-3 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] transition-all focus:outline-none focus:border-[var(--color-accent)]"
            {...register('referralCode')}
          />
          {errors.referralCode && (
            <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{errors.referralCode.message}</p>
          )}
        </div>

        {/* Terms of Service Checkbox */}
        <div className="pt-1">
          <div className="flex items-start gap-2.5">
            <input
              id="terms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-[var(--color-rule-2)] text-[var(--color-accent)] accent-[var(--color-accent)] cursor-pointer"
              {...register('terms')}
            />
            <label
              htmlFor="terms"
              className="text-[13px] text-[var(--color-ink-2)] leading-[1.5] cursor-pointer select-none"
            >
              I agree to the{' '}
              <Link
                href="/terms"
                className="text-[var(--color-accent)] hover:underline underline-offset-[3px]"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-[var(--color-accent)] hover:underline underline-offset-[3px]"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{errors.terms.message}</p>
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
          className="w-full rounded-xl bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white py-4 font-semibold text-[15.5px] tracking-wide transition-all duration-200 shadow-none hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Switch to Login Link */}
      <p className="mt-7 text-center text-[13.5px] text-[var(--color-ink-2)]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-[var(--color-accent)] hover:underline underline-offset-4"
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}
