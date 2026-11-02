'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { Check, Gift, Sparkles, ShieldCheck, Clock, ArrowRight, X, Heart, Loader2, CreditCard } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/stores/auth-store'
import { api } from '@/lib/api-client'
import { startPaystackCheckout } from '@/lib/paystack'
import { JoyFaqSection } from '@/components/marketing/joy-faq'
import type { AuthUser, SubscriptionPlanId } from '@propella/shared'

interface PlanFeature {
  text: string
  included: boolean
}

const freeFeatures: PlanFeature[] = [
  { text: '5 practice questions per day', included: true },
  { text: 'Access to official syllabus topics', included: true },
  { text: 'Basic AI tutor explanations (3 queries/day)', included: true },
  { text: 'Standard progress tracker', included: true },
  { text: 'Full timed CBT mock exam simulations', included: false },
  { text: '11,404+ verified past questions library', included: false },
  { text: 'Undergraduate Course Files & Document AI', included: false },
  { text: 'Predictive score engine & pacing metrics', included: false },
]

const basicFeatures: PlanFeature[] = [
  { text: 'Full access for 1 student account (30 days)', included: true },
  { text: '11,404+ CBT past questions with detailed solutions', included: true },
  { text: 'Unlimited timed JAMB, WAEC & NECO mocks', included: true },
  { text: 'AI tutor explanations & hints on difficult concepts', included: true },
  { text: 'Performance analytics & speed statistics', included: true },
  { text: 'Spaced revision planner & study roadmap', included: true },
]

const sharedFeatures: PlanFeature[] = [
  { text: '👥 Full Scholar access for 2 separate accounts', included: true },
  { text: 'Buy once and share with your friend or family', included: true },
  { text: 'Save 25% (costs only ₦750/student in first month)', included: true },
  { text: 'Independent progress, scores, and analytics for each', included: true },
  { text: 'All 11,404+ CBT past questions & timed mock exams', included: true },
  { text: 'Unlimited AI tutor explanations on every device', included: true },
]

const tillExamFeatures: PlanFeature[] = [
  { text: '⭐ Complete access right up until your exam day', included: true },
  { text: 'All 3 major exam tracks (JAMB, WAEC & NECO)', included: true },
  { text: 'Undergraduate Course Files (100L–500L) included', included: true },
  { text: 'Priority AI tutor responses & exam prediction engine', included: true },
  { text: 'Offline practice mode & printable mock worksheets', included: true },
  { text: 'Full syllabus mastery & unlimited CBT simulations', included: true },
]

const pricingFaqs = [
  {
    q: 'How does the ₦999 / 50% Welcome Discount & Auto-Renewal work?',
    a: 'Every newly registered student gets a 72-hour (3-day) window to subscribe at 50% off (₦999 for Basic, ₦1,499 for Shared, or ₦4,999 for Full Pass). Checkout uses a Nigerian debit card (Mastercard, Visa, or Verve) via Paystack so your subscription seamlessly auto-renews the following month at the standard price (₦1,999 / ₦2,999 / ₦9,999). Each card can only claim the welcome discount once to prevent abuse. You can cancel auto-renewal anytime in Settings before your next billing date.',
  },
  {
    q: 'How does the "Subscribe for a Friend" feature work?',
    a: 'Click "Subscribe for a Friend" above. Enter your friend or child\'s email address and select their plan. Once checkout is completed, they instantly receive a celebratory email notification with their pre-activated voucher and login credentials.',
  },
  {
    q: 'Can I switch between JAMB and Undergraduate Mode?',
    a: 'Yes, with a single account! When in high school mode you get the full JAMB/WAEC/NECO syllabus and mock test engine. When in undergraduate mode, you get university Course Files and Document AI. You can toggle between them in Settings anytime without losing any saved data.',
  },
  {
    q: 'Can two students share a subscription?',
    a: 'Yes! The Shared Scholar Plan (from ₦1,499 welcome / ₦2,999 standard) gives you two separate, independent accounts. Both learners get their own login credentials, private syllabus roadmap, individual streak tracker, and independent CBT test history.',
  },
  {
    q: 'Can I pause a timed CBT mock exam if power cuts or network drops?',
    a: 'Yes! All exam sessions save state in real time. If NEPA takes light or you lose internet connection, your question selections and countdown timer are securely preserved. When you return, you can resume exactly where you left off.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [giftFriendName, setGiftFriendName] = useState('')
  const [giftFriendEmail, setGiftFriendEmail] = useState('')
  const [giftPlan, setGiftPlan] = useState<'basic' | 'shared' | 'till_exam'>('basic')
  const [giftMessage, setGiftMessage] = useState('')
  const [giftSubmitted, setGiftSubmitted] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<SubscriptionPlanId | 'gift' | null>(null)
  const [bannerAlert, setBannerAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [discountEligibleServer, setDiscountEligibleServer] = useState<boolean | null>(null)
  const [discountExpiresAtServer, setDiscountExpiresAtServer] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    api
      .get<{ data: { discountEligible?: boolean; discountExpiresAt?: string | null } }>('/subscriptions/current')
      .then((res) => {
        if (typeof res.data?.discountEligible === 'boolean') {
          setDiscountEligibleServer(res.data.discountEligible)
          setDiscountExpiresAtServer(res.data.discountExpiresAt ?? null)
        }
      })
      .catch(() => {
        // ignore
      })
  }, [user])

  // New visitors (unauthenticated) or users within 72h of registration see the 50% welcome discount
  const isDiscountEligible = (() => {
    if (!user) return true
    if (discountEligibleServer !== null) return discountEligibleServer
    if (user.plan === 'scholar') return false
    if (!user.createdAt) return true
    const elapsedMs = Date.now() - new Date(user.createdAt).getTime()
    return elapsedMs >= 0 && elapsedMs <= 72 * 60 * 60 * 1000
  })()

  const discountHoursLeft = (() => {
    const expiryIso =
      discountExpiresAtServer ||
      (user?.createdAt
        ? new Date(new Date(user.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString()
        : null)
    if (!expiryIso) return 72
    return Math.max(1, Math.ceil((new Date(expiryIso).getTime() - Date.now()) / (60 * 60 * 1000)))
  })()

  // Verify return from Paystack checkout callback if applicable
  useEffect(() => {
    const isCallback = searchParams.get('payment') === 'callback'
    const ref = searchParams.get('ref') || searchParams.get('reference')
    if (isCallback && ref) {
      api
        .get<{ data: { success: boolean; message: string } }>(
          `/subscriptions/verify/${encodeURIComponent(ref)}`,
        )
        .then(async (res) => {
          setBannerAlert({
            type: 'success',
            message: res.data?.message || 'Payment confirmed! Scholar subscription activated.',
          })
          try {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
          } catch {
            // ignore
          }
          const updated = await api.get<{ data: { user: AuthUser } }>('/users/me')
          if (updated?.data?.user) setUser(updated.data.user)
        })
        .catch((err) => {
          setBannerAlert({
            type: 'error',
            message: err.message || 'Could not verify payment reference.',
          })
        })
    }
  }, [searchParams, setUser])

  async function handlePlanCheckout(planId: SubscriptionPlanId) {
    if (!user) {
      router.push(`/signup?plan=${planId}`)
      return
    }

    setCheckoutLoading(planId)
    try {
      await startPaystackCheckout({
        plan: planId,
        onSuccess: async (reference) => {
          try {
            await api.get(`/subscriptions/verify/${encodeURIComponent(reference)}`)
            const updated = await api.get<{ data: { user: AuthUser } }>('/users/me')
            if (updated?.data?.user) setUser(updated.data.user)
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
            setBannerAlert({
              type: 'success',
              message: 'Subscription successfully activated with Paystack!',
            })
          } catch {
            // ignore
          } finally {
            setCheckoutLoading(null)
          }
        },
        onCancel: () => {
          setCheckoutLoading(null)
        },
      })
    } catch (err: any) {
      setBannerAlert({
        type: 'error',
        message: err.message || 'Failed to start Paystack checkout.',
      })
      setCheckoutLoading(null)
    }
  }

  async function handleGiftSubmit(e: React.FormEvent) {
    e.preventDefault()
    const targetPlan: SubscriptionPlanId =
      giftPlan === 'basic'
        ? 'scholar_basic'
        : giftPlan === 'shared'
          ? 'scholar_shared'
          : 'scholar_full'

    if (!user) {
      router.push(
        `/signup?gift=true&recipientEmail=${encodeURIComponent(giftFriendEmail)}&recipientName=${encodeURIComponent(giftFriendName)}&plan=${targetPlan}`,
      )
      return
    }

    setCheckoutLoading('gift')
    try {
      await startPaystackCheckout({
        plan: targetPlan,
        isGift: true,
        giftRecipientEmail: giftFriendEmail,
        giftRecipientName: giftFriendName,
        giftMessage,
        onSuccess: async (reference) => {
          try {
            await api.get(`/subscriptions/verify/${encodeURIComponent(reference)}`)
            setGiftSubmitted(true)
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
          } catch {
            // ignore
          } finally {
            setCheckoutLoading(null)
          }
        },
        onCancel: () => {
          setCheckoutLoading(null)
        },
      })
    } catch (err: any) {
      setBannerAlert({
        type: 'error',
        message: err.message || 'Failed to start gift checkout.',
      })
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="flex flex-col py-12">
      {bannerAlert && (
        <div className="max-w-[1240px] mx-auto px-6 w-full mb-6">
          <div
            className={`p-4 rounded-2xl text-sm flex items-start gap-3 border ${
              bannerAlert.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
            }`}
          >
            {bannerAlert.type === 'success' ? (
              <Check className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" />
            ) : (
              <X className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
            )}
            <div className="flex-1 font-semibold">{bannerAlert.message}</div>
            <button
              onClick={() => setBannerAlert(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center mb-12">
        <Badge variant="accent" className="mb-4 px-3 py-1 text-xs">
          Transparent, Student-Friendly Pricing
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-ink)] leading-[1.12] max-w-2xl mx-auto">
          Invest in Your Academic Future.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[var(--color-ink-2)] max-w-xl mx-auto">
          High-yield preparation for less than the cost of a single textbook. Start from just ₦999 in your first 3 days of registration.
        </p>

        {/* 3-Day 50% Welcome Discount Banner */}
        {isDiscountEligible && (
          <div className="mt-6 max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-emerald-500/15 border border-emerald-500/40 p-4 flex flex-wrap items-center justify-between gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-extrabold text-[var(--color-ink)]">
                    🎉 3-Day Welcome Offer: 50% OFF All Plans (Start at ₦999!)
                  </span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">
                    {user ? `${discountHoursLeft}h left` : '72h Window from Signup'}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--color-ink-2)] mt-0.5">
                  Enjoy 50% off your first billing cycle within 3 days of registration. Automatically renews next month at the standard rate via secure Paystack card checkout (cancel anytime).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscribe for a Friend Banner */}
        <div className="mt-4 max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-purple-500/10 via-[var(--color-accent-tint)] to-emerald-500/10 border border-[var(--color-accent)]/30 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] text-white flex items-center justify-center shrink-0">
              <Gift size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-ink)]">Supporting a Child, Sibling, or Friend?</h4>
              <p className="text-xs text-[var(--color-ink-2)]">You can sponsor or gift an active subscription directly to their account.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="accent"
            onClick={() => setGiftModalOpen(true)}
            className="shrink-0 font-semibold"
          >
            <Heart size={14} className="mr-1.5" />
            Subscribe for a Friend
          </Button>
        </div>
      </div>

      {/* 4 Plan Cards — Styled with Joyloo Design System */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {/* Free Tier */}
          <div className="flex flex-col justify-between rounded-[28px] border border-[var(--color-rule)] bg-white dark:bg-[#1A1813] p-8 shadow-sm joy-card-hover">
            <div>
              <p
                className="text-[18px] font-semibold text-[#1A1917] dark:text-white mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Free Starter
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className="text-[38px] font-semibold leading-none text-[#1A1917] dark:text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  ₦0
                </span>
                <span className="text-[14px] text-[var(--color-ink-3)]">/ forever sample</span>
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--color-ink-2)] mb-6">
                Perfect for exploring the syllabus and testing baseline knowledge.
              </p>

              <div className="h-px bg-[var(--color-rule)] mb-6" />

              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14.5px]">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        f.included ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className={f.included ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)] line-through'}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="secondary"
              className="w-full rounded-full py-5 font-semibold border border-[var(--color-rule-2)] hover:border-[var(--color-ink)] joy-btn-hover"
              asChild
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>

          {/* Basic Plan */}
          <div className="flex flex-col justify-between rounded-[28px] border border-[var(--color-rule)] bg-white dark:bg-[#1A1813] p-8 shadow-sm hover:border-[var(--color-accent)]/50 transition-colors relative joy-card-hover">
            {isDiscountEligible && (
              <span className="absolute -top-3.5 left-8 rounded-full bg-emerald-600 px-3.5 py-1 text-[13px] font-semibold text-white font-[family-name:var(--font-hand)]">
                🔥 50% Off First Month
              </span>
            )}
            <div>
              <p
                className="text-[18px] font-semibold text-[#1A1917] dark:text-white mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Basic Plan
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-[38px] font-semibold leading-none text-[#1A1917] dark:text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {isDiscountEligible ? '₦999' : '₦1,999'}
                </span>
                {isDiscountEligible && (
                  <span className="text-[16px] text-[var(--color-ink-3)] line-through font-semibold">
                    ₦1,999
                  </span>
                )}
                <span className="text-[14px] text-[var(--color-ink-3)]">/ first 30 days</span>
              </div>
              <p className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
                {isDiscountEligible
                  ? 'Auto-renews next month at ₦1,999/mo · Cancel anytime'
                  : 'Auto-renews monthly at ₦1,999/mo · Cancel anytime'}
              </p>
              <p className="text-[14px] leading-relaxed text-[var(--color-ink-2)] mb-6">
                Full Scholar access for 1 student account for a productive 30-day sprint.
              </p>

              <div className="h-px bg-[var(--color-rule)] mb-6" />

              <ul className="space-y-3 mb-8">
                {basicFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14.5px] text-[var(--color-ink)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="secondary"
              className="w-full rounded-full py-5 font-semibold border border-[var(--color-accent)]/40 hover:bg-[var(--color-accent-tint)] text-[var(--color-accent)] joy-btn-hover"
              disabled={checkoutLoading !== null}
              onClick={() => handlePlanCheckout('scholar_basic')}
            >
              {checkoutLoading === 'scholar_basic' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                `Choose Basic (${isDiscountEligible ? '₦999' : '₦1,999'})`
              )}
            </Button>
          </div>

          {/* Shared Plan (Two Accounts) — Featured Joyloo Butter Yellow Card */}
          <div
            className="flex flex-col justify-between rounded-[28px] border-2 border-[var(--color-ink)] p-8 shadow-[6px_6px_0_0_#1A1917] relative joy-card-hover"
            style={{ backgroundColor: '#FFE494', color: '#1A1917' }}
          >
            <span className="absolute -top-3.5 left-8 rounded-full bg-[var(--color-accent)] px-4 py-1 text-[13px] font-semibold text-white font-[family-name:var(--font-hand)] shadow-sm">
              👥 {isDiscountEligible ? 'Most Popular · 50% Off' : 'Most Popular · Save 25%'}
            </span>

            <div>
              <p
                className="text-[18px] font-semibold text-[#1A1917] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Shared Scholar Plan
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-[38px] font-semibold leading-none text-[#1A1917]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {isDiscountEligible ? '₦1,499' : '₦2,999'}
                </span>
                {isDiscountEligible && (
                  <span className="text-[16px] text-[#1A1917]/50 line-through font-semibold">
                    ₦2,999
                  </span>
                )}
                <span className="text-[14px] text-[#1A1917]/70">/ first 30 days</span>
              </div>
              <p className="text-[12px] font-semibold text-[#1A1917]/85 mb-4">
                {isDiscountEligible
                  ? 'Only ₦750/student! Auto-renews next month at ₦2,999 · Cancel anytime'
                  : 'Costs ₦1,500/student · Auto-renews monthly · Cancel anytime'}
              </p>
              <p className="text-[14px] leading-relaxed text-[#1A1917]/80 mb-6">
                Buy one plan and share with a friend or sibling. 2 accounts get full Scholar access!
              </p>

              <div className="h-px bg-[#1A1917]/20 mb-6" />

              <ul className="space-y-3 mb-8">
                {sharedFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14.5px] text-[#1A1917] font-medium">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A1917] text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full rounded-full py-5 font-semibold bg-[#1A1917] text-white hover:bg-[var(--color-accent)] shadow-md joy-btn-hover"
              disabled={checkoutLoading !== null}
              onClick={() => handlePlanCheckout('scholar_shared')}
            >
              {checkoutLoading === 'scholar_shared' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                `Get Shared Plan (${isDiscountEligible ? '₦1,499' : '₦2,999'})`
              )}
            </Button>
          </div>

          {/* Pay Once Till Exam */}
          <div className="flex flex-col justify-between rounded-[28px] border border-[var(--color-rule)] bg-white dark:bg-[#1A1813] p-8 shadow-sm hover:border-emerald-500/50 transition-colors relative joy-card-hover">
            {isDiscountEligible && (
              <span className="absolute -top-3.5 left-8 rounded-full bg-emerald-600 px-3.5 py-1 text-[13px] font-semibold text-white font-[family-name:var(--font-hand)]">
                ⭐ 50% Off First Period
              </span>
            )}
            <div>
              <p
                className="text-[18px] font-semibold text-[#1A1917] dark:text-white mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Pay Once Till Exam
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-[38px] font-semibold leading-none text-[#1A1917] dark:text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {isDiscountEligible ? '₦4,999' : '₦9,999'}
                </span>
                {isDiscountEligible && (
                  <span className="text-[16px] text-[var(--color-ink-3)] line-through font-semibold">
                    ₦9,999
                  </span>
                )}
                <span className="text-[14px] text-[var(--color-ink-3)]">/ exam pass</span>
              </div>
              <p className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
                {isDiscountEligible
                  ? '50% welcome discount · Renews at standard ₦9,999 after first cycle'
                  : 'Complete exam season coverage'}
              </p>
              <p className="text-[14px] leading-relaxed text-[var(--color-ink-2)] mb-6">
                Complete Scholar access right up until your examination day.
              </p>

              <div className="h-px bg-[var(--color-rule)] mb-6" />

              <ul className="space-y-3 mb-8">
                {tillExamFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14.5px] text-[var(--color-ink)] font-medium">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="secondary"
              className="w-full rounded-full py-5 font-semibold border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 joy-btn-hover"
              disabled={checkoutLoading !== null}
              onClick={() => handlePlanCheckout('scholar_full')}
            >
              {checkoutLoading === 'scholar_full' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                `Get Pass (${isDiscountEligible ? '₦4,999' : '₦9,999'})`
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Student Success Showcase */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 mb-20">
        <div className="rounded-3xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-8 sm:p-12">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-[var(--color-rule)] shadow-xl">
              <Image
                src="https://images.pexels.com/photos/6146961/pexels-photo-6146961.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="Nigerian and African students studying together for JAMB and university exams"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-xs">
                <div className="font-semibold text-[var(--color-ink)] flex items-center justify-between">
                  <span>Average JAMB Score</span>
                  <span className="text-emerald-600 font-mono font-bold">296 / 400</span>
                </div>
                <p className="text-[11px] text-[var(--color-ink-3)] mt-0.5">Based on 14,000+ active candidates on Propella</p>
              </div>
            </div>

            <div className="space-y-5">
              <Badge variant="accent" className="px-3 py-1 text-xs">
                Guaranteed Value
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                Everything You Need to Ace Your Exams, All in One Place.
              </h3>
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                Whether you choose the 1-Month Scholar or Full Exam Package, you get access to Nigeria&apos;s largest verified CBT past question bank, AI tutor explanations, and syllabus-mapped practice designed to save you hundreds of hours of trial and error.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)]">
                  <span className="block text-xl font-extrabold text-[var(--color-ink)]">11,404+</span>
                  <span className="text-xs text-[var(--color-ink-3)]">CBT Past Questions</span>
                </div>
                <div className="p-3.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)]">
                  <span className="block text-xl font-extrabold text-[var(--color-ink)]">94.6%</span>
                  <span className="text-xs text-[var(--color-ink-3)]">Exam Pass Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Security & Methods */}
      <div className="max-w-[1000px] mx-auto px-6 mb-20 text-center">
        <p className="text-xs text-[var(--color-ink-3)] uppercase tracking-widest font-mono mb-4">
          Safe, Instant Nigerian Card Checkout via Paystack
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-xs font-medium text-[var(--color-ink-2)]">
          <span>✓ Paystack Instant Card Checkout</span>
          <span>✓ Nigerian Debit Cards (Mastercard, Visa, Verve)</span>
          <span>✓ Automatic Renewal at Standard Rate (Cancel Anytime)</span>
          <span>✓ One-Card-Per-Discount Anti-Abuse Protection</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <JoyFaqSection
        eyebrow="Pricing FAQs"
        title="Frequently asked pricing & billing questions"
        faqs={pricingFaqs}
        tone="paper"
      />

      {/* Subscribe for a Friend Modal */}
      {giftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setGiftModalOpen(false)
                setGiftSubmitted(false)
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                <Gift size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Gift a Propella Subscription</h3>
                <p className="text-xs text-[var(--color-ink-2)]">Empower a student to achieve academic excellence.</p>
              </div>
            </div>

            {giftSubmitted ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={32} />
                </div>
                <h4 className="font-bold text-base text-[var(--color-ink)] mb-1">Gift Order Initialized!</h4>
                <p className="text-xs text-[var(--color-ink-2)] max-w-sm mx-auto mb-4">
                  An email has been dispatched to <strong>{giftFriendEmail}</strong> with their access key for the{' '}
                  {giftPlan === 'basic'
                    ? 'Basic Plan (₦1,999)'
                    : giftPlan === 'shared'
                      ? 'Shared Plan (₦2,999)'
                      : 'Pay Once Till Exam (₦9,999)'}.
                </p>
                <Button
                  variant="accent"
                  onClick={() => {
                    setGiftModalOpen(false)
                    setGiftSubmitted(false)
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGiftSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="friendName" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Student&apos;s Full Name
                  </Label>
                  <Input
                    id="friendName"
                    placeholder="e.g. Ebuka Adeleke"
                    value={giftFriendName}
                    onChange={(e) => setGiftFriendName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="friendEmail" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Student&apos;s Email Address
                  </Label>
                  <Input
                    id="friendEmail"
                    type="email"
                    placeholder="e.g. ebuka@gmail.com"
                    value={giftFriendEmail}
                    onChange={(e) => setGiftFriendEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[var(--color-ink-2)] mb-1.5 block">
                    Choose Subscription Gift
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label
                      className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition-all ${
                        giftPlan === 'basic'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)]'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper-2)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[var(--color-ink)]">Basic</span>
                        <input
                          type="radio"
                          name="giftPlan"
                          checked={giftPlan === 'basic'}
                          onChange={() => setGiftPlan('basic')}
                        />
                      </div>
                      <span className="text-sm font-extrabold text-[var(--color-ink)]">₦1,999</span>
                      <span className="text-[10px] text-[var(--color-ink-3)]">30 days 1 account</span>
                    </label>

                    <label
                      className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition-all ${
                        giftPlan === 'shared'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)]'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper-2)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[var(--color-ink)]">Shared (2 Accts)</span>
                        <input
                          type="radio"
                          name="giftPlan"
                          checked={giftPlan === 'shared'}
                          onChange={() => setGiftPlan('shared')}
                        />
                      </div>
                      <span className="text-sm font-extrabold text-[var(--color-ink)]">₦2,999</span>
                      <span className="text-[10px] text-[var(--color-ink-3)]">30 days 2 accounts</span>
                    </label>

                    <label
                      className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition-all ${
                        giftPlan === 'till_exam'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper-2)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[var(--color-ink)]">Till Exam</span>
                        <input
                          type="radio"
                          name="giftPlan"
                          checked={giftPlan === 'till_exam'}
                          onChange={() => setGiftPlan('till_exam')}
                        />
                      </div>
                      <span className="text-sm font-extrabold text-[var(--color-ink)]">₦9,999</span>
                      <span className="text-[10px] text-[var(--color-ink-3)]">Full exam pass</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="giftMsg" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Personalized Encouragement Message (Optional)
                  </Label>
                  <textarea
                    id="giftMsg"
                    rows={2}
                    placeholder="e.g. Wishing you the very best in your UTME and WAEC exams this year!"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setGiftModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={checkoutLoading !== null}
                  >
                    {checkoutLoading === 'gift' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting Paystack…
                      </>
                    ) : (
                      `Proceed to Gift Checkout (₦${giftPlan === 'basic' ? '1,999' : giftPlan === 'shared' ? '2,999' : '9,999'})`
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
