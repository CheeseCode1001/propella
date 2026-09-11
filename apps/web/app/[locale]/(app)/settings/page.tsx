'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SignOutDialog } from '@/components/auth/sign-out-dialog'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import { PushDeviceRow } from '@/components/settings/push-device-row'
import { ReferralPanel } from '@/components/settings/referral-panel'
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
    <Card>
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Exam settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Label htmlFor="examDate" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)', display: 'block', marginBottom: 6 }}>
              Exam date
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

function PlanTab() {
  const t = useTranslations('settings')
  const user = useAuthStore((s) => s.user)
  const plan = user?.plan ?? 'free'

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Your plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}
          >
            {t('currentPlan')}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 500,
              color: 'var(--color-ink)',
              textTransform: 'capitalize',
            }}
          >
            {plan === 'scholar' ? t('scholarPlan') : t('freePlan')}
          </p>
        </div>

        {plan === 'free' && (
          <div
            style={{
              padding: 20,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-accent)',
              backgroundColor: 'var(--color-accent-tint)',
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 15,
                color: 'var(--color-ink)',
                marginBottom: 8,
              }}
            >
              {t('upgradePlan')}
            </p>
            <ul style={{ padding: '0 0 0 16px', margin: 0 }}>
              {[
                '50-minute pomodoro sessions',
                'Unlimited AI assistant messages',
                'Advanced analytics',
                'Priority quiz generation',
              ].map((feature) => (
                <li
                  key={feature}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    color: 'var(--color-ink-2)',
                    marginBottom: 6,
                  }}
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {plan === 'free' && (
          <Button variant="accent" disabled>
            Upgrade — coming soon
          </Button>
        )}

        {plan === 'scholar' && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-3)' }}>
            You have full access to all Scholar features.
          </p>
        )}
      </CardContent>
    </Card>
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
