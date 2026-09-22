'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Check, Gift, Sparkles, ShieldCheck, HelpCircle, ArrowRight, X, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  { text: '6,994 verified past questions library', included: false },
  { text: 'Undergraduate Course Files & Document AI', included: false },
  { text: 'Predictive score engine & pacing metrics', included: false },
]

const monthlyFeatures: PlanFeature[] = [
  { text: 'Unlimited practice questions across all subjects', included: true },
  { text: '6,994 past questions with step-by-step solutions', included: true },
  { text: 'Real timed CBT mock engine (JAMB/WAEC/NECO)', included: true },
  { text: 'Undergraduate Course Files (100L–500L) access', included: true },
  { text: 'AI assistant document querying & summaries', included: true },
  { text: 'Detailed mastery analytics & speed statistics', included: true },
  { text: 'Full study roadmap & spaced revision planner', included: true },
  { text: 'Standard email & WhatsApp support', included: true },
]

const fullPackageFeatures: PlanFeature[] = [
  { text: 'Everything in 1-Month Scholar plan', included: true },
  { text: 'Full Year / Lifetime Pre-Varsity & Undergrad access', included: true },
  { text: 'All 3 major exam tracks (JAMB, WAEC & NECO)', included: true },
  { text: 'Unlimited AI Tutor messages & course document parsing', included: true },
  { text: 'Offline practice mode & printable mock papers', included: true },
  { text: 'Priority WhatsApp concierge tutor support', included: true },
  { text: '300+ JAMB score money-back performance guarantee', included: true },
  { text: 'Bonus ₦2,000 digital referral wallet boost', included: true },
]

export default function PricingPage() {
  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [giftFriendName, setGiftFriendName] = useState('')
  const [giftFriendEmail, setGiftFriendEmail] = useState('')
  const [giftPlan, setGiftPlan] = useState<'monthly' | 'package'>('monthly')
  const [giftMessage, setGiftMessage] = useState('')
  const [giftSubmitted, setGiftSubmitted] = useState(false)

  function handleGiftSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGiftSubmitted(true)
  }

  return (
    <div className="flex flex-col py-12">
      {/* Header */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center mb-16">
        <Badge variant="accent" className="mb-4 px-3 py-1 text-xs">
          Transparent, Student-Friendly Pricing
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-ink)] leading-[1.12] max-w-2xl mx-auto">
          Invest in Your Academic Future.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[var(--color-ink-2)] max-w-xl mx-auto">
          High-yield preparation for less than the cost of a single textbook. Start free and upgrade when you are ready to ace your exams.
        </p>

        {/* Subscribe for a Friend Banner */}
        <div className="mt-8 max-w-2xl mx-auto rounded-2xl bg-gradient-to-r from-purple-500/10 via-[var(--color-accent-tint)] to-emerald-500/10 border border-[var(--color-accent)]/30 p-4 flex flex-wrap items-center justify-between gap-4">
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

      {/* 3 Tier Cards */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 w-full mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-8 shadow-sm">
            <div>
              <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-ink-3)] mb-2">
                Free Starter
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-[var(--color-ink)]">₦0</span>
                <span className="text-xs text-[var(--color-ink-3)]">/ forever</span>
              </div>
              <p className="text-xs text-[var(--color-ink-3)] mb-6">
                Perfect for exploring the platform and testing your baseline knowledge.
              </p>

              <div className="h-px bg-[var(--color-rule)] mb-6" />

              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs">
                    <Check
                      size={15}
                      className={f.included ? 'text-emerald-500 shrink-0 mt-0.5' : 'text-gray-300 dark:text-gray-600 shrink-0 mt-0.5'}
                    />
                    <span className={f.included ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)] line-through'}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="secondary" className="w-full font-semibold" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>

          {/* 1-Month Scholar Plan */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-paper)] p-8 shadow-xl relative">
            <Badge variant="accent" className="absolute -top-3 right-6 shadow-sm">
              Most Popular
            </Badge>

            <div>
              <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-accent)] mb-2">
                1-Month Scholar
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-[var(--color-ink)]">₦2,500</span>
                <span className="text-xs text-[var(--color-ink-3)]">/ 30 days</span>
              </div>
              <p className="text-xs text-[var(--color-ink-3)] mb-6">
                Full comprehensive access for an intense month of mock prep and course work.
              </p>

              <div className="h-px bg-[var(--color-rule)] mb-6" />

              <ul className="space-y-3 mb-8">
                {monthlyFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-ink)]">
                    <Check size={15} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="accent" className="w-full font-semibold" asChild>
              <Link href="/signup">Subscribe for ₦2,500</Link>
            </Button>
          </div>

          {/* Full Exam Package */}
          <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-gradient-to-b from-[var(--color-paper)] to-[var(--color-paper-2)] p-8 shadow-sm">
            <div>
              <Badge className="mb-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px]">
                Best Value Package
              </Badge>
              <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-ink)] mb-2">
                Full Exam Package
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-[var(--color-ink)]">₦15,000</span>
                <span className="text-xs text-[var(--color-ink-3)]">/ one-time full access</span>
              </div>
              <p className="text-xs text-[var(--color-ink-3)] mb-6">
                Complete all-inclusive package covering your entire exam season & undergraduate year.
              </p>

              <div className="h-px bg-[var(--color-rule)] mb-6" />

              <ul className="space-y-3 mb-8">
                {fullPackageFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-ink)] font-medium">
                    <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="secondary" className="w-full font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" asChild>
              <Link href="/signup">Get Full Package (₦15,000)</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Security & Methods */}
      <div className="max-w-[1000px] mx-auto px-6 mb-20 text-center">
        <p className="text-xs text-[var(--color-ink-3)] uppercase tracking-widest font-mono mb-4">
          Safe, Instant Nigerian Payment Gateways
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-xs font-medium text-[var(--color-ink-2)]">
          <span>✓ Paystack Instant Checkout</span>
          <span>✓ Flutterwave</span>
          <span>✓ Nigerian Debit Cards (Mastercard, Visa, Verve)</span>
          <span>✓ Direct Bank Transfer & USSD</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center text-[var(--color-ink)] mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)]">
            <h4 className="font-bold text-sm text-[var(--color-ink)] mb-1">
              Can I pay using direct bank transfer or USSD?
            </h4>
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              Yes! At checkout via Paystack or Flutterwave, select the &ldquo;Bank Transfer&rdquo; or &ldquo;USSD&rdquo; option. A temporary Nigerian account number is generated, and your account unlocks automatically within seconds of sending the funds.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)]">
            <h4 className="font-bold text-sm text-[var(--color-ink)] mb-1">
              How does the &ldquo;Subscribe for a Friend&rdquo; feature work?
            </h4>
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              Click &ldquo;Subscribe for a Friend&rdquo; above. Enter your friend or child&apos;s email address and select their plan. Once completed, they instantly receive a celebratory email notification with their pre-activated voucher and login credentials.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)]">
            <h4 className="font-bold text-sm text-[var(--color-ink)] mb-1">
              Can I switch between JAMB and Undergraduate Mode?
            </h4>
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              Yes, with a single account! When in highschool mode you get the full JAMB/WAEC/NECO syllabus and mock test engine. When in undergraduate mode, you get university Course Files and Document AI. You can toggle between them in Settings anytime without losing any saved data.
            </p>
          </div>
        </div>
      </div>

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
                  {giftPlan === 'monthly' ? '1-Month Scholar Plan (₦2,500)' : 'Full Exam Package (₦15,000)'}.
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
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        giftPlan === 'monthly'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)]'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper-2)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[var(--color-ink)]">1-Month Scholar</span>
                        <input
                          type="radio"
                          name="giftPlan"
                          checked={giftPlan === 'monthly'}
                          onChange={() => setGiftPlan('monthly')}
                        />
                      </div>
                      <span className="text-base font-extrabold text-[var(--color-ink)]">₦2,500</span>
                      <span className="text-[10px] text-[var(--color-ink-3)]">30 days unlimited access</span>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        giftPlan === 'package'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper-2)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[var(--color-ink)]">Full Package</span>
                        <input
                          type="radio"
                          name="giftPlan"
                          checked={giftPlan === 'package'}
                          onChange={() => setGiftPlan('package')}
                        />
                      </div>
                      <span className="text-base font-extrabold text-[var(--color-ink)]">₦15,000</span>
                      <span className="text-[10px] text-[var(--color-ink-3)]">Full exam season bundle</span>
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
                  <Button type="submit" variant="accent">
                    Proceed to Gift Checkout (₦{giftPlan === 'monthly' ? '2,500' : '15,000'})
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
