'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, Link } from '@/lib/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { AuthUser } from '@propella/shared'
import { Mail, CheckCircle2 } from 'lucide-react'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SEC = 60

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')?.trim() ?? ''
  const t = useTranslations('auth')
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setAccessToken)

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC)
  const [devCode, setDevCode] = useState<string | null>(null)

  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const code = digits.join('')
  const isComplete = code.length === CODE_LENGTH

  const activeEmail = emailParam || user?.email || ''

  // Already verified — only redirect if the user is already signed in AND there is no pending emailParam
  useEffect(() => {
    if (!emailParam && user?.emailVerified) {
      router.replace('/onboarding')
    }
  }, [emailParam, user?.emailVerified, router])

  // If verifying a pending signup email, clear any mismatched stale user session
  useEffect(() => {
    if (emailParam && user && user.email.toLowerCase() !== emailParam.toLowerCase()) {
      setUser(null)
      setToken('')
    }
  }, [emailParam, user, setUser, setToken])

  // Auto-focus the first digit input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputsRef.current[0]?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  // Development convenience: with no mail provider configured the API hands the
  // pending code back so sign-up is testable. Returns 404 in production.
  const loadDevCode = useCallback(async () => {
    try {
      const url = activeEmail
        ? `/auth/dev-verification-code?email=${encodeURIComponent(activeEmail)}`
        : '/auth/dev-verification-code'
      const res = await api.get<{ data: { code: string | null } }>(url)
      setDevCode(res.data.code)
    } catch {
      setDevCode(null)
    }
  }, [activeEmail])

  useEffect(() => {
    let cancelled = false
    const url = activeEmail
      ? `/auth/dev-verification-code?email=${encodeURIComponent(activeEmail)}`
      : '/auth/dev-verification-code'
    api
      .get<{ data: { code: string | null } }>(url)
      .then((res) => {
        if (!cancelled) setDevCode(res.data.code)
      })
      .catch(() => {
        if (!cancelled) setDevCode(null)
      })
    return () => {
      cancelled = true
    }
  }, [activeEmail])

  const submit = useCallback(
    async (value: string) => {
      if (value.length !== CODE_LENGTH || submitting) return
      setSubmitting(true)
      setError(null)
      setNotice(null)
      try {
        if (emailParam) {
          // Confirming registration creates the user account and signs them in
          const res = await api.post<{ data: { user: AuthUser; accessToken: string } }>(
            '/auth/verify-signup',
            { email: emailParam, code: value },
          )
          setToken(res.data.accessToken)
          setUser(res.data.user)
          router.replace('/onboarding')
        } else {
          // Logged in user confirming their email
          await api.post('/auth/verify-email', { code: value })
          if (user) setUser({ ...user, emailVerified: true })
          router.replace('/onboarding')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not verify that code')
        setDigits(Array(CODE_LENGTH).fill(''))
        inputsRef.current[0]?.focus()
        setSubmitting(false)
      }
    },
    [emailParam, router, setToken, setUser, submitting, user],
  )

  function fill(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    const next = Array(CODE_LENGTH).fill('')
    for (let i = 0; i < cleaned.length; i++) next[i] = cleaned[i]!
    setDigits(next)
    inputsRef.current[Math.min(cleaned.length, CODE_LENGTH - 1)]?.focus()
    return cleaned
  }

  function handleChange(index: number, raw: string) {
    const value = raw.replace(/\D/g, '')

    if (!value) {
      setDigits((prev) => prev.map((d, i) => (i === index ? '' : d)))
      return
    }

    const next = [...digits]
    for (let i = 0; i < value.length && index + i < CODE_LENGTH; i++) {
      next[index + i] = value[i]!
    }
    setDigits(next)
    inputsRef.current[Math.min(index + value.length, CODE_LENGTH - 1)]?.focus()

    const filled = next.join('')
    if (filled.length === CODE_LENGTH) void submit(filled)
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  async function handleResend() {
    setResending(true)
    setError(null)
    setNotice(null)
    try {
      if (emailParam) {
        await api.post('/auth/resend-signup-code', { email: emailParam })
      } else {
        await api.post('/auth/resend-verification', {})
      }
      setNotice('A new 6-digit code has been dispatched to your email.')
      setCooldown(RESEND_COOLDOWN_SEC)
      setDigits(Array(CODE_LENGTH).fill(''))
      await loadDevCode()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code')
    } finally {
      setResending(false)
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
          Check Your Inbox
        </h1>
        <p className="text-[15px] text-[var(--color-ink-2)] leading-relaxed">
          We&apos;ve sent a 6-digit verification code to{' '}
          <strong className="text-[var(--color-ink)] font-semibold">{activeEmail || 'your email'}</strong>
        </p>
      </div>

      {/* Dev helper code */}
      {devCode && (
        <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/30 p-3.5">
          <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-300 mb-1">
            Local Dev Mode — No SMTP configured
          </p>
          <div className="flex items-center justify-between">
            <code className="font-mono text-[17px] font-bold tracking-[0.25em] text-[var(--color-ink)]">
              {devCode}
            </code>
            <button
              type="button"
              onClick={() => void submit(fill(devCode))}
              className="text-[12.5px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
            >
              Fill code
            </button>
          </div>
        </div>
      )}

      {/* 6-Digit input boxes */}
      <div className="flex gap-2 sm:gap-2.5 justify-between mb-6">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el
            }}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => {
              e.preventDefault()
              const pasted = fill(e.clipboardData.getData('text'))
              if (pasted.length === CODE_LENGTH) void submit(pasted)
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={CODE_LENGTH}
            aria-label={`Digit ${i + 1}`}
            disabled={submitting}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center rounded-xl border border-[var(--color-rule-2)] bg-transparent dark:bg-[#1A1813] text-[var(--color-ink)] text-[22px] sm:text-[24px] font-bold font-mono focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none transition-all disabled:opacity-50"
          />
        ))}
      </div>

      {error && (
        <div className="text-[13px] text-[var(--color-danger)] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 mb-5" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="text-[13px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Verify Button */}
      <button
        type="button"
        disabled={!isComplete || submitting}
        onClick={() => void submit(code)}
        className="w-full rounded-xl bg-[#1A1917] dark:bg-white text-white dark:text-[#1A1917] hover:bg-[var(--color-accent)] dark:hover:bg-[var(--color-accent)] dark:hover:text-white py-3.5 text-[15px] font-semibold transition-all duration-150 active:scale-[0.99] disabled:opacity-40 cursor-pointer"
      >
        {submitting ? 'Verifying Code...' : 'Verify Email'}
      </button>

      {/* Resend button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13.5px]">
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={cooldown > 0 || resending}
          className="font-medium text-[var(--color-accent)] hover:underline disabled:text-[var(--color-ink-3)] disabled:no-underline disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : 'Didn’t receive code? Resend'}
        </button>

        <Link
          href="/login"
          className="text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors"
        >
          Back to Sign in
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-[var(--color-ink-3)] text-sm">Loading verification...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
