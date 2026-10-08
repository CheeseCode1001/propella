'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  LogOut,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  RefreshCw,
  X,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SignOutDialog } from '@/components/auth/sign-out-dialog'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import { PushDeviceRow } from '@/components/settings/push-device-row'
import { ReferralPanel } from '@/components/settings/referral-panel'
import { startPaystackCheckout } from '@/lib/paystack'
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from '@propella/shared'
import type { AuthUser } from '@propella/shared'

type TabId = 'profile' | 'exam' | 'referrals' | 'notifications' | 'plan' | 'privacy'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'exam', label: 'Exam' },
  { id: 'referrals', label: 'Invite friends' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'plan', label: 'Plan' },
  { id: 'privacy', label: 'Privacy' },
]

interface ProfileForm {
  name: string
  timezone: string
  theme: 'system' | 'light' | 'dark'
}

interface ExamForm {
  examDate: string
  dailyStudyMinutes: number
}

interface NotificationsForm {
  email: boolean
  push: boolean
  studyReminders: boolean
  streakReminders: boolean
  weeklyDigest: boolean
}

interface UserSettings {
  name: string
  timezone: string
  theme: 'system' | 'light' | 'dark'
  notifications: NotificationsForm
  plan: 'free' | 'scholar'
}

interface ExamProfile {
  examDate: string
  dailyStudyMinutes: number
  leaderboardOptIn?: boolean
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-paper-3)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          backgroundColor: 'white',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 0',
        borderBottom: '1px solid var(--color-rule)',
      }}
    >
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function ProfileTab() {
  const t = useTranslations('settings')
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [saved, setSaved] = useState(false)

  // Saved on its own rather than with the form, so the picture updates the
  // moment it is chosen — including the avatar in the sidebar.
  const handleAvatarChange = useCallback(
    async (avatarUrl: string | null) => {
      const updated = await api.patch<{ data: AuthUser }>('/users/me', { avatarUrl })
      setUser(updated.data)
    },
    [setUser],
  )
  const { register, handleSubmit } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name ?? '',
      timezone: user?.timezone ?? 'Africa/Lagos',
      theme: user?.theme ?? 'system',
    },
  })

  async function onSubmit(data: ProfileForm) {
    try {
      await api.patch('/users/me', data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{t('profile')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Label htmlFor="name" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)', display: 'block', marginBottom: 6 }}>
              {t('name')}
            </Label>
            <Input id="name" {...register('name')} />
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)', marginBottom: 10 }}>
              Profile picture
            </p>
            <AvatarUpload
              value={user?.avatarUrl ?? null}
              initial={user?.name?.charAt(0).toUpperCase() ?? 'U'}
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <Label htmlFor="timezone" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)', display: 'block', marginBottom: 6 }}>
              {t('timezone')}
            </Label>
            <Input id="timezone" {...register('timezone')} />
          </div>

          <div>
            <Label style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)', display: 'block', marginBottom: 8 }}>
              {t('theme')}
            </Label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['system', 'light', 'dark'] as const).map((t) => (
                <label
                  key={t}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <input type="radio" value={t} {...register('theme')} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-2)', textTransform: 'capitalize' }}>
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Button variant="accent" type="submit">
              {saved ? 'Saved' : t('saveChanges')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ExamTab() {
  const t = useTranslations('settings')
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [undergradMode, setUndergradMode] = useState(user?.undergraduateMode ?? false)
  const [undergradSaving, setUndergradSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['exam-profile-settings'],
    queryFn: () =>
      api
        .get<{ data: ExamProfile }>('/onboarding/profile')
        .then((r) => r.data)
        .catch(() => null),
  })

  const { register, handleSubmit } = useForm<ExamForm>({
    defaultValues: {
      examDate: profile?.examDate?.slice(0, 10) ?? '',
      dailyStudyMinutes: profile?.dailyStudyMinutes ?? 120,
    },
  })

  async function handleUndergradToggle(val: boolean) {
    setUndergradSaving(true)
    try {
      const res = await api.patch<{ data: AuthUser }>('/users/profile', { undergraduateMode: val })
      if (res?.data) {
        setUser(res.data)
      } else if (user) {
        setUser({ ...user, undergraduateMode: val })
      }
      setUndergradMode(val)
    } catch (err) {
      console.error('Failed to update undergraduate mode', err)
    } finally {
      setUndergradSaving(false)
    }
  }

  async function onSubmit(data: ExamForm) {
    try {
      await api.patch('/onboarding/profile', data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Undergraduate Mode Switch */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Academic Track & Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleRow
            label="Undergraduate Mode"
            description="Organize your studies by university courses and year levels (100L–500L), upload course materials, and query your notes directly with AI. All your JAMB, WAEC, and NECO records remain safely preserved in one account."
            checked={undergradMode}
            onChange={handleUndergradToggle}
          />
          {undergradSaving && (
            <p className="text-xs text-[var(--color-ink-3)] mt-2">Updating your academic track...</p>
          )}
          {undergradMode && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/20 text-xs text-[var(--color-ink)] leading-relaxed">
              🎓 <strong>Undergraduate Mode is Active:</strong> Your navigation now features <strong>Course Files</strong> where you can upload and classify past questions, lecture slides, and notes by academic year. The highschool syllabus is hidden while you are in this mode.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Exam Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <Label htmlFor="examDate" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)', display: 'block', marginBottom: 6 }}>
                Target exam date
              </Label>
              <Input id="examDate" type="date" {...register('examDate')} />
            </div>
            <div>
              <Label htmlFor="dailyStudy" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)', display: 'block', marginBottom: 6 }}>
                Daily study commitment (minutes)
              </Label>
              <Input
                id="dailyStudy"
                type="number"
                min={15}
                max={480}
                {...register('dailyStudyMinutes', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Button variant="accent" type="submit">
                {saved ? 'Saved' : t('saveChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsTab() {
  const t = useTranslations('settings')
  const user = useAuthStore((s) => s.user)
  const [notifications, setNotifications] = useState<NotificationsForm>({
    email: true,
    push: true,
    studyReminders: true,
    streakReminders: true,
    weeklyDigest: true,
  })
  const [saved, setSaved] = useState(false)

  function toggle(key: keyof NotificationsForm) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSave() {
    try {
      await api.patch('/users/me', { notifications })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{t('notifications')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ToggleRow
          label="Email notifications"
          description="Receive updates and reminders via email"
          checked={notifications.email}
          onChange={() => toggle('email')}
        />
        <ToggleRow
          label="Push notifications"
          description="Browser push notifications"
          checked={notifications.push}
          onChange={() => toggle('push')}
        />

        {/* The preference above says whether we send; this is whether this
            device has actually agreed to receive. Both have to be on. */}
        <PushDeviceRow enabled={notifications.push} />
        <ToggleRow
          label="Study reminders"
          description="Daily reminders to keep your streak going"
          checked={notifications.studyReminders}
          onChange={() => toggle('studyReminders')}
        />
        <ToggleRow
          label="Streak warnings"
          description="Alert when your streak is at risk"
          checked={notifications.streakReminders}
          onChange={() => toggle('streakReminders')}
        />
        <div style={{ paddingTop: 4 }}>
          <ToggleRow
            label={t('notifWeeklyDigest')}
            description="Summary of your progress each week"
            checked={notifications.weeklyDigest}
            onChange={() => toggle('weeklyDigest')}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <Button variant="accent" onClick={handleSave}>
            {saved ? 'Saved' : 'Save preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface SubscriptionData {
  plan: 'free' | 'scholar'
  planExpiresAt: string | null
  isActive: boolean
  daysRemaining: number
  activeSubscription: {
    id: string
    plan: SubscriptionPlanId
    planName: string
    amount: number
    status: string
    startDate: string
    expiresAt: string
    reference: string
    isGift: boolean
    isShared?: boolean
    sharedWithEmail?: string | null
  } | null
  history: Array<{
    id: string
    reference: string
    amount: number
    currency: string
    status: string
    channel: string | null
    paidAt: string | null
    createdAt: string
  }>
}

function PlanTab() {
  const t = useTranslations('settings')
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [verifying, setVerifying] = useState(false)
  const [verificationAlert, setVerificationAlert] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [upgradingPlan, setUpgradingPlan] = useState<SubscriptionPlanId | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showPlans, setShowPlans] = useState(false)

  // Fetch current subscription status & history
  const { data: subData, isLoading, refetch } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: () =>
      api.get<{ data: SubscriptionData }>('/subscriptions/current').then((r) => r.data),
  })

  // Check for Paystack payment callback in URL (?payment=callback&ref=...)
  useEffect(() => {
    const isPaymentCallback = searchParams.get('payment') === 'callback'
    const ref = searchParams.get('ref') || searchParams.get('reference')

    if (isPaymentCallback && ref && !verifying && !verificationAlert) {
      setVerifying(true)
      api
        .get<{ data: { success: boolean; message: string; planExpiresAt?: string } }>(
          `/subscriptions/verify/${encodeURIComponent(ref)}`,
        )
        .then(async (res) => {
          setVerificationAlert({
            type: 'success',
            message:
              res.data?.message || 'Payment confirmed! Your Scholar plan has been activated.',
          })
          try {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            })
          } catch {
            // ignore confetti error
          }
          // Refresh user profile
          const updatedMe = await api.get<{ data: { user: AuthUser } }>('/users/me')
          if (updatedMe?.data?.user) {
            setUser(updatedMe.data.user)
          }
          await refetch()
          queryClient.invalidateQueries({ queryKey: ['user-subscription'] })
        })
        .catch((err) => {
          setVerificationAlert({
            type: 'error',
            message: err.message || 'Could not verify payment. Please check your transaction reference.',
          })
        })
        .finally(() => {
          setVerifying(false)
        })
    }
  }, [searchParams, setUser, refetch, queryClient, verifying, verificationAlert])

  async function handleUpgrade(planId: SubscriptionPlanId) {
    setUpgradingPlan(planId)
    try {
      await startPaystackCheckout({
        plan: planId,
        onSuccess: async (reference) => {
          setVerifying(true)
          try {
            await api.get(`/subscriptions/verify/${encodeURIComponent(reference)}`)
            const updated = await api.get<{ data: { user: AuthUser } }>('/users/me')
            if (updated?.data?.user) setUser(updated.data.user)
            await refetch()
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
            setVerificationAlert({
              type: 'success',
              message: 'Payment confirmed! Welcome to Scholar.',
            })
          } catch {
            // ignore
          } finally {
            setVerifying(false)
            setUpgradingPlan(null)
          }
        },
        onCancel: () => {
          setUpgradingPlan(null)
        },
      })
    } catch (err: any) {
      setVerificationAlert({
        type: 'error',
        message: err.message || 'Failed to initialize Paystack checkout. Please try again.',
      })
      setUpgradingPlan(null)
    }
  }

  async function handleCancelSubscription() {
    setCancelling(true)
    try {
      await api.post('/subscriptions/cancel')
      await refetch()
      setCancelModalOpen(false)
      setVerificationAlert({
        type: 'success',
        message: 'Your subscription has been cancelled. You retain full Scholar access until your current billing cycle ends.',
      })
    } catch (err: any) {
      setVerificationAlert({
        type: 'error',
        message: err.message || 'Could not cancel subscription. Please contact support.',
      })
    } finally {
      setCancelling(false)
    }
  }

  const [partnerEmail, setPartnerEmail] = useState('')
  const [linkingPartner, setLinkingPartner] = useState(false)
  const [partnerAlert, setPartnerAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleLinkPartner(e: React.FormEvent) {
    e.preventDefault()
    if (!partnerEmail.trim()) return
    setLinkingPartner(true)
    setPartnerAlert(null)
    try {
      const res = await api.post<{ data: { message: string } }>('/subscriptions/link-shared', {
        partnerEmail: partnerEmail.trim(),
      })
      setPartnerAlert({
        type: 'success',
        message: res.data?.message || 'Partner linked successfully! They now have Scholar access.',
      })
      setPartnerEmail('')
      await refetch()
    } catch (err: any) {
      setPartnerAlert({
        type: 'error',
        message: err.message || 'Could not link partner account.',
      })
    } finally {
      setLinkingPartner(false)
    }
  }

  const isScholar = (user?.plan === 'scholar' || subData?.plan === 'scholar') && (subData?.isActive ?? true)
  const expiresAt = user?.planExpiresAt || subData?.planExpiresAt
  const daysLeft = subData?.daysRemaining ?? 0
  const isSharedPlan =
    subData?.activeSubscription?.plan === 'scholar_shared' ||
    Boolean(subData?.activeSubscription?.isShared)

  return (
    <div className="space-y-6">
      {/* Verification State Banner */}
      {verifying && (
        <Card className="border-[var(--color-accent)] bg-[var(--color-accent-tint)] p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
          <div className="text-sm font-medium text-[var(--color-ink)]">
            Confirming your Paystack payment and unlocking Scholar access…
          </div>
        </Card>
      )}

      {verificationAlert && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
            verificationAlert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
          }`}
        >
          {verificationAlert.type === 'success' ? (
            <Check className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{verificationAlert.message}</p>
          </div>
          <button
            onClick={() => setVerificationAlert(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Current Plan Overview Card */}
      <Card className="overflow-hidden border border-[var(--color-rule)]">
        <CardHeader className="bg-[var(--color-paper-2)] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-ink-3)]">
                {t('currentPlan')}
              </p>
              <div className="flex items-center gap-2.5 mt-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] flex items-center gap-2">
                  {isScholar ? (
                    <>
                      <Sparkles className="h-6 w-6 text-amber-500 shrink-0" />
                      Scholar Member
                    </>
                  ) : (
                    'Free Starter Plan'
                  )}
                </h3>
                {isScholar ? (
                  <Badge variant="accent" className="font-semibold text-xs py-0.5">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-xs py-0.5">
                    Free Tier
                  </Badge>
                )}
              </div>
            </div>

            {isScholar && (
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <Calendar size={13} />
                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Active'}
                </span>
                {expiresAt && (
                  <p className="text-[11px] text-[var(--color-ink-3)] mt-1">
                    Renews / Expires: {new Date(expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isScholar ? (
            <div className="space-y-5">
              <p className="text-sm text-[var(--color-ink-2)]">
                You have full, unrestricted access to all verified past question papers, realistic timed CBT simulations, unlimited AI tutor questions, and undergraduate university course files.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="accent"
                  onClick={() => setShowPlans(!showPlans)}
                  className="font-semibold text-xs"
                >
                  <RefreshCw size={14} className="mr-1.5" />
                  {showPlans ? 'Hide Subscription Options' : 'Extend / Change Plan'}
                </Button>

                {subData?.activeSubscription && subData.activeSubscription.status !== 'cancelled' && (
                  <Button
                    variant="ghost"
                    onClick={() => setCancelModalOpen(true)}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                  >
                    Cancel Auto-Renewal
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-ink-2)]">
                You are currently on the Free tier. Upgrade to Scholar to unlock 6,994+ CBT past questions, step-by-step verified solutions, timed UTME/WAEC exam simulators, and unlimited AI tutor support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared Plan Partner Card (if on a Shared Plan) */}
      {isScholar && isSharedPlan && (
        <Card className="border border-[var(--color-accent)]/30 bg-[var(--color-accent-tint)]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center">
                👥
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Shared Plan (Two Accounts)</CardTitle>
                <p className="text-xs text-[var(--color-ink-3)]">
                  Your plan includes full Scholar access for two separate student accounts.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {subData?.activeSubscription?.sharedWithEmail ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-rule)] text-xs">
                <div>
                  <span className="text-[var(--color-ink-3)] block text-[11px]">Linked Partner Account:</span>
                  <span className="font-bold text-[var(--color-ink)]">{subData.activeSubscription.sharedWithEmail}</span>
                </div>
                <Badge variant="success" className="text-[10px]">Active Scholar</Badge>
              </div>
            ) : (
              <form onSubmit={handleLinkPartner} className="space-y-2">
                <p className="text-xs text-[var(--color-ink-2)]">
                  Enter your friend or sibling&apos;s email address to give them full Scholar access immediately:
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="friend@gmail.com"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className="text-xs"
                    required
                  />
                  <Button type="submit" variant="accent" size="sm" disabled={linkingPartner} className="shrink-0 text-xs font-semibold">
                    {linkingPartner ? 'Linking…' : 'Link Partner'}
                  </Button>
                </div>
              </form>
            )}

            {partnerAlert && (
              <p className={`text-xs font-medium ${partnerAlert.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {partnerAlert.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Selection Grid (shown if Free or when Scholar clicks Extend) */}
      {(!isScholar || showPlans) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-[var(--color-ink)]">
              Choose Your Subscription Package
            </h4>
            <span className="text-xs text-[var(--color-ink-3)] font-mono">
              Instant Nigerian Bank & Card Checkout
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Basic Plan */}
            <div className="relative rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-6 shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/50 transition-colors">
              <div>
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-accent)] mb-1">
                  Basic Plan
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-[var(--color-ink)]">₦1,999</span>
                  <span className="text-xs text-[var(--color-ink-3)]">/ 30 days</span>
                </div>
                <p className="text-xs text-[var(--color-ink-3)] mb-4">
                  Full Scholar access for 1 student account for an intense 30-day prep sprint.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-[var(--color-ink)]">
                  {[
                    '6,994+ past questions with step-by-step solutions',
                    'Realistic timed CBT simulator (JAMB, WAEC, NECO)',
                    'Unlimited AI Assistant explanations',
                    '50-minute Pomodoro focus in Marathon mode',
                    '1 Student account full access',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="secondary"
                className="w-full font-semibold border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10"
                disabled={upgradingPlan !== null}
                onClick={() => handleUpgrade('scholar_basic')}
              >
                {upgradingPlan === 'scholar_basic' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting Paystack…
                  </>
                ) : (
                  <>
                    <CreditCard size={15} className="mr-2" />
                    Choose Basic (₦1,999)
                  </>
                )}
              </Button>
            </div>

            {/* Shared Plan (Two Accounts) */}
            <div className="relative rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-paper)] p-6 shadow-md flex flex-col justify-between">
              <Badge variant="accent" className="absolute -top-2.5 right-6 text-[10px]">
                👥 Two Accounts
              </Badge>

              <div>
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--color-accent)] mb-1">
                  Shared Plan
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-[var(--color-ink)]">₦2,999</span>
                  <span className="text-xs text-[var(--color-ink-3)]">/ 30 days</span>
                </div>
                <p className="text-xs text-[var(--color-ink-3)] mb-4">
                  Buy one plan and share with your friend or family. 2 accounts get full Scholar access!
                </p>

                <ul className="space-y-2 mb-6 text-xs text-[var(--color-ink)] font-medium">
                  {[
                    'Full Scholar access for 2 separate accounts',
                    'Save 25% (costs only ₦1,500/student)',
                    '6,994+ past questions & timed CBT mocks for both',
                    'Independent progress, XP, and revision trackers',
                    'Unlimited AI tutor messages on every device',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="accent"
                className="w-full font-semibold shadow-md"
                disabled={upgradingPlan !== null}
                onClick={() => handleUpgrade('scholar_shared')}
              >
                {upgradingPlan === 'scholar_shared' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting Paystack…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="mr-2" />
                    Get Shared Plan (₦2,999)
                  </>
                )}
              </Button>
            </div>

            {/* Pay Once Till Exam */}
            <div className="relative rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-[var(--color-paper)] to-emerald-500/5 p-6 shadow-sm flex flex-col justify-between">
              <Badge className="absolute -top-2.5 right-6 bg-emerald-600 text-white text-[10px]">
                ⭐ Best Value Pass
              </Badge>

              <div>
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                  Pay Once Till Exam
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-[var(--color-ink)]">₦9,999</span>
                  <span className="text-xs text-[var(--color-ink-3)]">/ full pass</span>
                </div>
                <p className="text-xs text-[var(--color-ink-3)] mb-4">
                  One-time payment covering your entire exam season and varsity year. Zero renewal worries.
                </p>

                <ul className="space-y-2 mb-6 text-xs text-[var(--color-ink)]">
                  {[
                    'Full access right up until your exam day',
                    'All 3 major exam tracks (JAMB, WAEC & NECO)',
                    'Undergraduate Course Files (100L–500L) access',
                    'Unlimited mock exams & timed simulator',
                    'Priority AI tutor responses & exam prediction engine',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 font-medium">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="secondary"
                className="w-full font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                disabled={upgradingPlan !== null}
                onClick={() => handleUpgrade('scholar_full')}
              >
                {upgradingPlan === 'scholar_full' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting Paystack…
                  </>
                ) : (
                  <>
                    <CreditCard size={15} className="mr-2 text-emerald-600" />
                    Get Pass (₦9,999)
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Payment Gateway Trust Indicators */}
          <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4 text-xs text-[var(--color-ink-2)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>
                Processed securely via <strong>Paystack</strong>. Accepts Debit Cards, USSD, Bank Transfer &amp; OPay.
              </span>
            </div>
            <span className="text-[11px] text-[var(--color-ink-3)] font-mono">
              256-Bit SSL Encryption
            </span>
          </div>
        </div>
      )}

      {/* Payment History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-[var(--color-ink)]">
            Billing &amp; Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-xs text-[var(--color-ink-3)] py-4">Loading transaction history…</p>
          ) : !subData?.history || subData.history.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--color-ink-3)]">
              No previous billing records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--color-rule)] text-[var(--color-ink-3)] font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-rule)] text-[var(--color-ink)]">
                  {subData.history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[var(--color-paper-2)] transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-ink-2)]">
                        {tx.reference}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        ₦{tx.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 capitalize text-[var(--color-ink-2)]">
                        {tx.channel || 'Paystack'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            tx.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Auto-Renewal Confirmation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">
              Cancel Scholar Auto-Renewal?
            </h3>
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed mb-6">
              You will not be billed again. Your Scholar benefits will remain active until the end of your current billing period (
              {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'cycle end'}
              ), after which your account will return to the Free plan. None of your notes or study progress will be lost.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                disabled={cancelling}
                onClick={() => setCancelModalOpen(false)}
              >
                Keep Subscription
              </Button>
              <Button
                variant="danger"
                disabled={cancelling}
                onClick={handleCancelSubscription}
              >
                {cancelling ? 'Cancelling…' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PrivacyTab() {
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(true)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    try {
      await api.patch('/users/me', { leaderboardOptIn })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Privacy</CardTitle>
      </CardHeader>
      <CardContent>
        <ToggleRow
          label="Appear on leaderboard"
          description="Show your name and XP on the public leaderboard"
          checked={leaderboardOptIn}
          onChange={setLeaderboardOptIn}
        />
        <div style={{ marginTop: 20 }}>
          <Button variant="accent" onClick={handleSave}>
            {saved ? 'Saved' : 'Save preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const tAuth = useTranslations('auth')
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const [signOutOpen, setSignOutOpen] = useState(false)

  const tabParam = searchParams.get('tab') as TabId | null
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : 'profile',
  )

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      // Intentional: deep links such as /settings?tab=plan select the tab.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const tabContent: Record<TabId, React.ReactNode> = {
    profile: <ProfileTab />,
    exam: <ExamTab />,
    referrals: <ReferralPanel />,
    notifications: <NotificationsTab />,
    plan: <PlanTab />,
    privacy: <PrivacyTab />,
  }

  return (
    <div style={{ width: "100%", margin: '0 auto' }}>
      {/* Header */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 40,
          fontWeight: 500,
          color: 'var(--color-ink)',
          marginBottom: 32,
        }}
      >
        {t('title')}
      </h1>

      {/* Tab bar */}
      <div
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--color-rule)',
          marginBottom: 28,
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-ink-3)',
              fontFamily: 'var(--font-sans)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.id === 'profile'
              ? t('profile')
              : tab.id === 'notifications'
              ? t('notifications')
              : tab.id === 'plan'
              ? t('plan')
              : tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabContent[activeTab]}

      {/* Sign out — mobile surface */}
      <div style={{ marginTop: 32 }}>
        <button
          onClick={() => setSignOutOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px 0',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          {tAuth('logout')}
        </button>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-ink-3)',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          Signed in as {user?.email}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-ink-3)',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          Propella v1.0.0
        </p>
      </div>

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </div>
  )
}
