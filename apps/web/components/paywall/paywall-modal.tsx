'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown1,
  CloseCircle,
  TickCircle,
  MagicStar,
  Book1,
  Flash,
  DocumentText1,
  Timer1,
} from 'iconsax-reactjs'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'
import { usePaywallStore } from '@/lib/stores/paywall-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  SUBSCRIPTION_PLANS,
  WELCOME_DISCOUNT_WINDOW_MS,
  type SubscriptionPlanId,
} from '@propella/shared'
import { startPaystackCheckout } from '@/lib/paystack'

const SUMMARY_FEATURES = [
  {
    icon: Book1,
    title: 'All Topics & Syllabuses',
    desc: 'Full access across all secondary subjects without locks',
  },
  {
    icon: MagicStar,
    title: '24/7 AI Personal Tutor',
    desc: 'Unlimited step-by-step solutions and custom study queries',
  },
  {
    icon: DocumentText1,
    title: 'Full JAMB & WAEC Mocks',
    desc: 'Simulate official exam hall conditions with timed auto-marking',
  },
  {
    icon: Flash,
    title: 'Adaptive Practice Quizzes',
    desc: 'Over 10,000 curated past questions with instant answer explanations',
  },
]

const FREE_FEATURES = [
  { text: '5 practice questions per day', included: true },
  { text: 'Access to official syllabus topics', included: true },
  { text: 'Basic AI tutor explanations (3 queries/day)', included: true },
  { text: 'Standard progress tracker', included: true },
  { text: 'Full timed CBT mock exam simulations', included: false },
  { text: '10,000+ verified past questions library', included: false },
  { text: 'Undergraduate Course Files & Document AI', included: false },
  { text: 'Predictive score engine & pacing metrics', included: false },
]

const BASIC_FEATURES = [
  { text: 'Full access for 1 student account (30 days)', included: true },
  { text: '10,000+ CBT past questions with detailed solutions', included: true },
  { text: 'Unlimited timed JAMB, WAEC & NECO mocks', included: true },
  { text: 'AI tutor explanations & hints on difficult concepts', included: true },
  { text: 'Performance analytics & speed statistics', included: true },
  { text: 'Spaced revision planner & study roadmap', included: true },
]

const SHARED_FEATURES = [
  { text: '👥 Full Scholar access for 2 separate accounts', included: true },
  { text: 'Buy once and share with your friend or family', included: true },
  { text: 'Save extra per student on 2 accounts', included: true },
  { text: 'Independent progress, scores, and analytics for each', included: true },
  { text: 'All 10,000+ CBT past questions & timed mock exams', included: true },
  { text: 'Unlimited AI tutor explanations on every device', included: true },
]

const TILL_EXAM_FEATURES = [
  { text: '⭐ Complete access right up until your exam day', included: true },
  { text: 'All 3 major exam tracks (JAMB, WAEC & NECO)', included: true },
  { text: 'Undergraduate Course Files (100L–500L) included', included: true },
  { text: 'Priority AI tutor responses & exam prediction engine', included: true },
  { text: 'Offline practice mode & printable mock worksheets', included: true },
]

export function PaywallModal() {
  const { isOpen, message, closePaywall } = usePaywallStore()
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const [view, setView] = useState<'unlock' | 'compare'>('unlock')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('scholar_basic')
  const [checkoutLoading, setCheckoutLoading] = useState<SubscriptionPlanId | boolean>(false)

  // Determine if user is within the 3-day (72-hour) 50% welcome discount window
  const discountInfo = useMemo(() => {
    if (user?.entitlements?.discountEligible !== undefined) {
      const expiresAtMs = user.entitlements.discountExpiresAt
        ? new Date(user.entitlements.discountExpiresAt).getTime()
        : 0
      const hoursLeft = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60)))
      return {
        eligible: user.entitlements.discountEligible,
        hoursLeft,
      }
    }
    if (user?.createdAt) {
      const expiresAtMs = new Date(user.createdAt).getTime() + WELCOME_DISCOUNT_WINDOW_MS
      const eligible = user.plan === 'free' && Date.now() < expiresAtMs
      const hoursLeft = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60)))
      return { eligible, hoursLeft }
    }
    return { eligible: true, hoursLeft: 72 }
  }, [user])

  if (!isOpen) return null

  const isDiscount = discountInfo.eligible

  async function handleCheckout(planToCheckout?: SubscriptionPlanId) {
    const plan = planToCheckout || selectedPlan
    setCheckoutLoading(plan)
    try {
      await startPaystackCheckout({
        plan,
        onSuccess: () => {
          closePaywall()
          window.location.reload()
        },
        onCancel: () => {
          setCheckoutLoading(false)
        },
      })
    } catch {
      router.push('/pricing')
      closePaywall()
    } finally {
      setCheckoutLoading(false)
    }
  }

  function handleClose() {
    setView('unlock')
    closePaywall()
  }

  const activePlanObj = SUBSCRIPTION_PLANS[selectedPlan]
  const displayPrice = isDiscount ? activePlanObj.discountPrice : activePlanObj.price

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm"
      />

      <div className="fixed inset-0 z-[251] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          key={view}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full ${
            view === 'compare' ? 'max-w-5xl' : 'max-w-xl'
          } rounded-3xl bg-[var(--color-paper)] p-5 sm:p-8 shadow-2xl border border-amber-500/25 overflow-hidden my-auto max-h-[92vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient gold glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors p-1 z-10"
            aria-label="Close"
          >
            <CloseCircle size={24} />
          </button>

          {/* ── VIEW 1: SUMMARY UNLOCK MODAL ─────────────────────────────────── */}
          {view === 'unlock' && (
            <div>
              {/* Header pill & badge */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
                  <Crown1 size={14} variant="Bold" />
                  Propella Scholar Access
                </span>
                {isDiscount && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Timer1 size={13} variant="Bold" />
                    50% Welcome Discount · {discountInfo.hoursLeft}h left
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                {isDiscount ? 'Start Scholar for Just ₦999 (50% Off)' : 'Unlock Full Access'}
              </h2>

              <p className="mt-2 text-sm sm:text-base text-[var(--color-ink-2)] leading-relaxed">
                {message ||
                  'Upgrade to Scholar to continue studying with unlimited access to all topics, AI step-by-step tutoring, and mock examinations.'}
              </p>

              {/* Features grid */}
              <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUMMARY_FEATURES.map((f, i) => {
                  const Icon = f.icon
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--color-paper-2)]/90 backdrop-blur-sm border border-[var(--color-rule)] hover:border-amber-500/30 transition-colors"
                    >
                      <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 text-amber-600 dark:text-amber-400 shrink-0">
                        <Icon size={18} variant="Bold" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--color-ink)]">{f.title}</h4>
                        <p className="text-[11px] text-[var(--color-ink-3)] leading-tight mt-0.5">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Plan selection selector */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-[var(--color-ink-3)] uppercase tracking-wider mb-2">
                  Select Your Plan {isDiscount ? '(50% Off First Month — Auto-Renews at Standard Rate)' : ''}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'scholar_basic' as SubscriptionPlanId,
                      name: 'Monthly',
                      price: isDiscount ? '₦999' : '₦1,999',
                      originalPrice: isDiscount ? '₦1,999' : null,
                      duration: isDiscount ? 'Then ₦1,999/mo' : '30 days',
                      badge: isDiscount ? '50% OFF' : null,
                    },
                    {
                      id: 'scholar_shared' as SubscriptionPlanId,
                      name: 'Shared (2)',
                      price: isDiscount ? '₦1,499' : '₦2,999',
                      originalPrice: isDiscount ? '₦2,999' : null,
                      duration: isDiscount ? 'Then ₦2,999/mo' : '₦1,500 each',
                      badge: 'POPULAR',
                    },
                    {
                      id: 'scholar_full' as SubscriptionPlanId,
                      name: 'Till Exam',
                      price: isDiscount ? '₦4,999' : '₦9,999',
                      originalPrice: isDiscount ? '₦9,999' : null,
                      duration: isDiscount ? '50% Welcome Off' : 'Full season',
                      badge: 'BEST VALUE',
                    },
                  ].map((p) => {
                    const isSelected = selectedPlan === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlan(p.id)}
                        className={`relative p-3 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-md'
                            : 'border-[var(--color-rule)] hover:border-amber-500/40 bg-[var(--color-paper-2)]'
                        }`}
                      >
                        {p.badge && (
                          <span className="absolute -top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                            {p.badge}
                          </span>
                        )}
                        <div className="text-xs font-semibold text-[var(--color-ink)] mt-0.5">{p.name}</div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-extrabold text-[var(--color-ink)] tracking-tight">
                            {p.price}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-[var(--color-ink-3)] line-through">
                              {p.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--color-ink-3)] mt-0.5">
                          {p.duration}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 text-amber-500">
                            <TickCircle size={14} variant="Bold" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* CTA actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={() => handleCheckout(selectedPlan)}
                  disabled={Boolean(checkoutLoading)}
                  className="w-full sm:flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-sm sm:text-base transition-all hover:scale-[1.01]"
                >
                  <Crown1 size={18} variant="Bold" />
                  {checkoutLoading
                    ? 'Opening Checkout...'
                    : `Subscribe for ₦${displayPrice.toLocaleString()}${isDiscount ? ' (50% Off)' : ''}`}
                </Button>

                <button
                  type="button"
                  onClick={() => setView('compare')}
                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline transition-colors py-2 px-3 flex items-center gap-1"
                >
                  Compare All Plans &rarr;
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-rule)] text-center">
                <p className="text-[11px] text-[var(--color-ink-3)]">
                  🔒 Card Checkout via Paystack · Auto-renews next month at standard price (₦{activePlanObj.price.toLocaleString()}) · Cancel anytime
                </p>
              </div>
            </div>
          )}

          {/* ── VIEW 2: COMPARE ALL PLANS MODAL ──────────────────────────────── */}
          {view === 'compare' && (
            <div>
              {/* Back navigation & header */}
              <div className="flex items-center justify-between mb-4 pr-8">
                <button
                  type="button"
                  onClick={() => setView('unlock')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
                >
                  <ArrowLeft size={16} />
                  Back to Quick Unlock
                </button>

                <Badge variant="accent" className="text-[11px] font-mono">
                  {isDiscount ? '50% Welcome Discount Active (3-Day Window)' : 'All Subscription Plans'}
                </Badge>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                  Compare Propella Plans
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-ink-2)] mt-1">
                  {isDiscount
                    ? 'New student 3-day offer: Get 50% off your first billing cycle across all plans (auto-renews next month at standard price).'
                    : 'Full feature breakdown across all plans. Select any plan below to proceed directly to Paystack checkout.'}
                </p>
              </div>

              {/* 4 Plan Cards in Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch mb-6">
                {/* 1. Free Starter */}
                <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]/80 p-5 shadow-sm">
                  <div>
                    <p className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--color-ink-3)] mb-1">
                      Free Starter
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-extrabold text-[var(--color-ink)]">₦0</span>
                      <span className="text-xs text-[var(--color-ink-3)]">/ sample</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-ink-3)] mb-4">
                      Explore official syllabus topics &amp; baseline testing.
                    </p>

                    <div className="h-px bg-[var(--color-rule)] mb-4" />

                    <ul className="space-y-2 mb-5">
                      {FREE_FEATURES.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px]">
                          <Check
                            size={13}
                            className={f.included ? 'text-emerald-500 shrink-0 mt-0.5' : 'text-gray-400 dark:text-gray-600 shrink-0 mt-0.5'}
                          />
                          <span className={f.included ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)] line-through'}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button variant="secondary" disabled className="w-full text-xs font-semibold opacity-70">
                      Current Free Plan
                    </Button>
                  </div>
                </div>

                {/* 2. Basic Plan */}
                <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]/80 p-5 shadow-sm hover:border-[var(--color-accent)]/50 transition-colors">
                  <div>
                    <p className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--color-accent)] mb-1">
                      Basic Plan
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-2xl font-extrabold text-[var(--color-ink)]">
                        {isDiscount ? '₦999' : '₦1,999'}
                      </span>
                      {isDiscount && (
                        <span className="text-xs text-[var(--color-ink-3)] line-through">₦1,999</span>
                      )}
                      <span className="text-xs text-[var(--color-ink-3)]">/ month</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-ink-3)] mb-4">
                      {isDiscount
                        ? '50% off first month, auto-renews at ₦1,999/mo.'
                        : 'Full Scholar access for 1 student for a 30-day sprint.'}
                    </p>

                    <div className="h-px bg-[var(--color-rule)] mb-4" />

                    <ul className="space-y-2 mb-5">
                      {BASIC_FEATURES.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--color-ink)]">
                          <Check size={13} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      className="w-full text-xs font-semibold border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10"
                      disabled={Boolean(checkoutLoading)}
                      onClick={() => handleCheckout('scholar_basic')}
                    >
                      {checkoutLoading === 'scholar_basic' ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Connecting…
                        </>
                      ) : (
                        `Choose Basic (${isDiscount ? '₦999' : '₦1,999'})`
                      )}
                    </Button>
                  </div>
                </div>

                {/* 3. Shared Plan (Two Accounts) */}
                <div className="flex flex-col justify-between rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-paper-2)]/90 p-5 shadow-md relative">
                  <Badge variant="accent" className="absolute -top-2.5 right-3 text-[9px] font-mono px-2 py-0.5 shadow-sm">
                    👥 Two Accounts
                  </Badge>

                  <div>
                    <p className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--color-accent)] mb-1">
                      Shared Plan
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-2xl font-extrabold text-[var(--color-ink)]">
                        {isDiscount ? '₦1,499' : '₦2,999'}
                      </span>
                      {isDiscount && (
                        <span className="text-xs text-[var(--color-ink-3)] line-through">₦2,999</span>
                      )}
                      <span className="text-xs text-[var(--color-ink-3)]">/ month</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-ink-3)] mb-4">
                      {isDiscount
                        ? '50% off first month for 2 accounts! Auto-renews at ₦2,999/mo.'
                        : 'Share with friend/family. 2 accounts get full Scholar access!'}
                    </p>

                    <div className="h-px bg-[var(--color-rule)] mb-4" />

                    <ul className="space-y-2 mb-5">
                      {SHARED_FEATURES.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--color-ink)] font-medium">
                          <Check size={13} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="accent"
                      className="w-full text-xs font-semibold shadow-sm"
                      disabled={Boolean(checkoutLoading)}
                      onClick={() => handleCheckout('scholar_shared')}
                    >
                      {checkoutLoading === 'scholar_shared' ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Connecting…
                        </>
                      ) : (
                        `Get Shared (${isDiscount ? '₦1,499' : '₦2,999'})`
                      )}
                    </Button>
                  </div>
                </div>

                {/* 4. Till Exam (Best Value) */}
                <div className="flex flex-col justify-between rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-b from-amber-500/10 via-[var(--color-paper-2)] to-[var(--color-paper-2)] p-5 shadow-lg relative">
                  <Badge className="absolute -top-2.5 right-3 text-[9px] font-mono px-2 py-0.5 shadow-sm bg-amber-500 hover:bg-amber-600 text-white border-0">
                    ⭐ Till Exam
                  </Badge>

                  <div>
                    <p className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-1">
                      Pay Once Till Exam
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-2xl font-extrabold text-[var(--color-ink)]">
                        {isDiscount ? '₦4,999' : '₦9,999'}
                      </span>
                      {isDiscount && (
                        <span className="text-xs text-[var(--color-ink-3)] line-through">₦9,999</span>
                      )}
                      <span className="text-xs text-[var(--color-ink-3)]">/ pass</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-ink-3)] mb-4">
                      {isDiscount
                        ? '50% welcome discount! Auto-renews at standard rate after term.'
                        : 'Complete access right up until your exam day.'}
                    </p>

                    <div className="h-px bg-[var(--color-rule)] mb-4" />

                    <ul className="space-y-2 mb-5">
                      {TILL_EXAM_FEATURES.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--color-ink)] font-medium">
                          <Check size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md border-0"
                      disabled={Boolean(checkoutLoading)}
                      onClick={() => handleCheckout('scholar_full')}
                    >
                      {checkoutLoading === 'scholar_full' ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Connecting…
                        </>
                      ) : (
                        `Get Till Exam (${isDiscount ? '₦4,999' : '₦9,999'})`
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer info & toggle back */}
              <div className="pt-3 border-t border-[var(--color-rule)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <p className="text-[11px] text-[var(--color-ink-3)]">
                  🔒 Instant Activation · Secure Card Checkout via Paystack · Auto-renews at standard price
                </p>
                <button
                  type="button"
                  onClick={() => setView('unlock')}
                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                >
                  &larr; Return to quick unlock view
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
