'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SEC = 60

export default function VerifyEmailPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

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

  // Already verified — nothing to do here.
  useEffect(() => {
    if (user?.emailVerified) router.replace('/onboarding')
  }, [user?.emailVerified, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  // Development convenience: with no mail provider configured the API hands the
  // pending code back so sign-up is testable. Returns 404 in production.
  const loadDevCode = useCallback(async () => {
    try {
      const res = await api.get<{ data: { code: string | null } }>('/auth/dev-verification-code')
      setDevCode(res.data.code)
    } catch {
      setDevCode(null)
    }
  }, [])

  useEffect(() => {
    // Fetched in a promise callback rather than awaited in the effect body, so
    // state is never set synchronously during the effect, and the result is
    // dropped if the screen unmounts first.
    let cancelled = false
    api
      .get<{ data: { code: string | null } }>('/auth/dev-verification-code')
      .then((res) => {
        if (!cancelled) setDevCode(res.data.code)
      })
      .catch(() => {
        if (!cancelled) setDevCode(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const submit = useCallback(
    async (value: string) => {
      if (value.length !== CODE_LENGTH || submitting) return
      setSubmitting(true)
      setError(null)
      setNotice(null)
      try {
        await api.post('/auth/verify-email', { code: value })
        if (user) setUser({ ...user, emailVerified: true })
        router.replace('/onboarding')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not verify that code')
        setDigits(Array(CODE_LENGTH).fill(''))
        inputsRef.current[0]?.focus()
        setSubmitting(false)
      }
    },
    [router, setUser, submitting, user],
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

    // Build the next array up front so the auto-submit decision happens here
    // rather than inside the state updater (updaters must stay pure — React
    // runs them twice in development).
    const next = [...digits]
    for (let i = 0; i < value.length && index + i < CODE_LENGTH; i++) {
      next[index + i] = value[i]!
    }
    setDigits(next)
    inputsRef.current[Math.min(index + value.length, CODE_LENGTH - 1)]?.focus()

    // join('') collapses empty slots, so a full six characters means every box
    // is filled. (An earlier `!filled.includes('')` check was always false —
    // every string "includes" the empty string — so this never fired.)
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
      await api.post('/auth/resend-verification', {})
      setNotice('A new code is on its way.')
      setCooldown(RESEND_COOLDOWN_SEC)
      setDigits(Array(CODE_LENGTH).fill(''))
      // The previous code is now void — pick up the replacement.
      await loadDevCode()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code')
    } finally {
      setResending(false)
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
            {t('verifyEmail')}
          </h1>
          <p className="text-[13px] text-[var(--color-ink-2)]">
            {t('verifyEmailSent')}{' '}
            <strong className="text-[var(--color-ink)]">{user?.email ?? 'your inbox'}</strong>.
          </p>
        </div>

        {devCode && (
          <div className="mb-5 rounded-[var(--radius-sm)] border border-[var(--color-warning)]/40 bg-[var(--color-warning-tint)] px-3 py-2.5">
            <p className="text-[12px] font-semibold text-[var(--color-warning)] mb-1">
              Development mode — no email provider configured
            </p>
            <div className="flex items-center gap-2">
              <code className="font-mono text-[18px] tracking-[0.22em] text-[var(--color-ink)]">
                {devCode}
              </code>
              <button
                type="button"
                onClick={() => void submit(fill(devCode))}
                className="text-[12px] font-semibold text-[var(--color-accent)] underline underline-offset-2 bg-transparent border-none cursor-pointer"
              >
                Use this code
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-between mb-5">
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
              className="w-full h-14 text-center rounded-[var(--radius-sm)] border-[1.5px] border-[var(--color-rule-2)] bg-[var(--color-paper-2)] text-[var(--color-ink)] text-[20px] font-mono focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-60"
            />
          ))}
        </div>

        {error && (
          <p className="text-[13px] text-[var(--color-danger)] mb-4" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="text-[13px] text-[var(--color-success)] mb-4">{notice}</p>}

        <Button
          variant="accent"
          size="lg"
          className="w-full"
          disabled={!isComplete || submitting}
          onClick={() => void submit(code)}
        >
          {submitting ? `${t('verifying')}...` : t('verifyEmailCta')}
        </Button>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={cooldown > 0 || resending}
            className="text-[13px] font-medium text-[var(--color-accent)] disabled:text-[var(--color-ink-3)] disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
          >
            {cooldown > 0 ? `${t('resendIn')} ${cooldown}s` : t('resendCode')}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
