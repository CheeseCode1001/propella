'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Users,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  BookOpen,
  FileQuestion,
  Sparkles,
  Clock,
  Target,
  Flame,
  Trophy,
} from 'lucide-react'
import { Providers } from './providers'
import { Shell, PageHeader } from '@/components/shell'
import { SkeletonMetrics } from '@/components/skeleton'
import { api } from '@/lib/api'

interface Metrics {
  users: { total: number; verified: number; onboarded: number; newLast7Days: number }
  content: { subjects: number; pastQuestions: number; quizzesGenerated: number }
  activity: {
    studySessions: number
    quizAttempts: number
    marathonRuns: number
    xpAwarded: number
  }
  pastQuestionsByExam: Array<{ exam: string; count: number }>
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  badge,
  badgeType = 'neutral',
}: {
  label: string
  value: number
  hint?: string
  icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  badge?: string
  badgeType?: 'accent' | 'success' | 'warning' | 'neutral'
}) {
  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && (
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'var(--accent-tint)',
                color: 'var(--accent)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon size={16} />
            </div>
          )}
          <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>{label}</span>
        </div>
        {badge && (
          <span className={`pill pill-${badgeType}`} style={{ fontSize: 11 }}>
            {badge}
          </span>
        )}
      </div>

      <div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--ink)' }}>
          {value.toLocaleString()}
        </div>
        {hint && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, fontWeight: 500 }}>{hint}</div>}
      </div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--ink-3)' }}>{subtitle}</p>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}
      >
        {children}
      </div>
    </section>
  )
}

function Overview() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.get<{ data: Metrics }>('/admin/metrics').then((r) => r.data),
  })

  if (isLoading) return <SkeletonMetrics />

  if (error || !data) {
    return (
      <div
        className="card"
        style={{
          padding: 32,
          textAlign: 'center',
          borderColor: 'var(--danger-tint)',
          background: 'var(--danger-tint)',
          color: 'var(--danger)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Could not load metrics from the API backend.</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: 14 }}
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    )
  }

  const verifiedPercent = data.users.total > 0 ? Math.round((data.users.verified / data.users.total) * 100) : 0
  const onboardedPercent = data.users.total > 0 ? Math.round((data.users.onboarded / data.users.total) * 100) : 0

  return (
    <>
      <Section title="Student Accounts" subtitle="Registration, identity verification & onboarding status">
        <Stat
          label="Total Users"
          value={data.users.total}
          icon={Users}
          hint="All registered student profiles"
        />
        <Stat
          label="Email Verified"
          value={data.users.verified}
          icon={CheckCircle2}
          badge={`${verifiedPercent}%`}
          badgeType="success"
          hint={`${verifiedPercent}% of total student accounts`}
        />
        <Stat
          label="Completed Onboarding"
          value={data.users.onboarded}
          icon={GraduationCap}
          badge={`${onboardedPercent}%`}
          badgeType="accent"
          hint="Configured curriculum & study goals"
        />
        <Stat
          label="New Last 7 Days"
          value={data.users.newLast7Days}
          icon={TrendingUp}
          badge="Live"
          badgeType="warning"
          hint="New registrations this week"
        />
      </Section>

      <Section title="Curriculum & Question Bank" subtitle="Official syllabus coverage and AI question banks">
        <Stat
          label="Syllabus Subjects"
          value={data.content.subjects}
          icon={BookOpen}
          badge="Core"
          hint="JAMB & WAEC syllabus subjects"
        />
        <Stat
          label="Past Questions"
          value={data.content.pastQuestions}
          icon={FileQuestion}
          hint={
            data.pastQuestionsByExam.length > 0
              ? data.pastQuestionsByExam
                  .map((e) => `${e.exam.toUpperCase()}: ${e.count}`)
                  .join(' · ')
              : 'None uploaded yet'
          }
        />
        <Stat
          label="Quizzes Generated"
          value={data.content.quizzesGenerated}
          icon={Sparkles}
          badge="AI Powered"
          badgeType="accent"
          hint="Diagnostic and practice quizzes"
        />
      </Section>

      <Section title="Learning Activity & Engagement" subtitle="Active student study time and gamification points">
        <Stat
          label="Study Sessions"
          value={data.activity.studySessions}
          icon={Clock}
          hint="Logged active reading blocks"
        />
        <Stat
          label="Quiz Attempts"
          value={data.activity.quizAttempts}
          icon={Target}
          hint="Completed topic drills"
        />
        <Stat
          label="Marathon Runs"
          value={data.activity.marathonRuns}
          icon={Flame}
          badge="Pomodoro"
          badgeType="warning"
          hint="Endurance study streaks"
        />
        <Stat
          label="XP Awarded"
          value={data.activity.xpAwarded}
          icon={Trophy}
          badge="Gamified"
          badgeType="accent"
          hint="Total student league points"
        />
      </Section>
    </>
  )
}

export default function AdminHomePage() {
  return (
    <Providers>
      <Shell>
        <PageHeader
          title="System Overview"
          subtitle="Platform metrics, user engagement, and curriculum activity"
        />
        <Overview />
      </Shell>
    </Providers>
  )
}
