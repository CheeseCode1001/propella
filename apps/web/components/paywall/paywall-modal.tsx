'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown1,
  CloseCircle,
  TickCircle,
  MagicStar,
  Book1,
  Flash,
  DocumentText1,
} from 'iconsax-reactjs'
import { useRouter } from '@/lib/i18n/navigation'
import { usePaywallStore } from '@/lib/stores/paywall-store'
import { Button } from '@/components/ui/button'
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from '@propella/shared'
import { startPaystackCheckout } from '@/lib/paystack'

const FEATURES = [
  {
    icon: Book1,
    title: 'All Topics & Syllabuses',
    desc: 'Full access across all 12 secondary subjects without locks',
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

export function PaywallModal() {
  const { isOpen, feature, message, closePaywall } = usePaywallStore()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('scholar_basic')
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  if (!isOpen) return null

  async function handleCheckout() {
    setCheckoutLoading(true)
    try {
      await startPaystackCheckout({
        plan: selectedPlan,
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

  function handleViewAllPlans() {
    closePaywall()
    router.push('/pricing')
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closePaywall}
        className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm"
      />

      <div className="fixed inset-0 z-[251] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          key="paywall-card"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl rounded-3xl bg-[var(--color-paper)] p-6 sm:p-8 shadow-2xl border border-amber-500/25 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient gold glow in top corner */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closePaywall}
            className="absolute top-5 right-5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors p-1 z-10"
            aria-label="Close"
          >
            <CloseCircle size={24} />
          </button>

          {/* Header pill & badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
              <Crown1 size={14} variant="Bold" />
              Propella Scholar Access
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
            Unlock Full Access
          </h2>

          <p className="mt-2 text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
            {message ||
              'You have reached your Free Trial limit. Upgrade to Scholar to continue studying with unlimited access to all topics, AI step-by-step tutoring, and mock examinations.'}
          </p>

          {/* Features grid */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--color-paper-2)]/90 backdrop-blur-sm border border-[var(--color-outline)]/80 hover:border-amber-500/30 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Icon size={18} variant="Bold" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-ink)]">{f.title}</h4>
                    <p className="text-[11px] text-[var(--color-ink-muted)] leading-tight mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Plan selection selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
              Select Your Plan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'scholar_basic' as SubscriptionPlanId,
                  name: 'Monthly',
                  price: '₦1,999',
                  duration: '30 days',
                  badge: null,
                },
                {
                  id: 'scholar_shared' as SubscriptionPlanId,
                  name: 'Shared (2)',
                  price: '₦2,999',
                  duration: '₦1,500 each',
                  badge: 'POPULAR',
                },
                {
                  id: 'scholar_full' as SubscriptionPlanId,
                  name: 'Till Exam',
                  price: '₦9,999',
                  duration: 'Full year',
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
                        : 'border-[var(--color-outline)] hover:border-amber-500/40 bg-[var(--color-paper-2)]'
                    }`}
                  >
                    {p.badge && (
                      <span className="absolute -top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                        {p.badge}
                      </span>
                    )}
                    <div className="text-xs font-semibold text-[var(--color-ink)] mt-0.5">{p.name}</div>
                    <div className="text-base font-extrabold text-[var(--color-ink)] mt-1 tracking-tight">
                      {p.price}
                    </div>
                    <div className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">
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
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full sm:flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-sm sm:text-base transition-all hover:scale-[1.01]"
            >
              <Crown1 size={18} variant="Bold" />
              {checkoutLoading
                ? 'Opening Checkout...'
                : `Subscribe for ${SUBSCRIPTION_PLANS[selectedPlan]?.price ? `₦${SUBSCRIPTION_PLANS[selectedPlan].price.toLocaleString()}` : ''}`}
            </Button>

            <button
              onClick={handleViewAllPlans}
              className="text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors py-2 px-3"
            >
              Compare All Plans &rarr;
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--color-outline)]/60 text-center">
            <p className="text-[11px] text-[var(--color-ink-muted)]">
              🔒 Instant Activation · Secure Checkout via Paystack · 100% Satisfaction
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
