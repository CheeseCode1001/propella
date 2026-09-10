'use client'

import { useQuery } from '@tanstack/react-query'
import { Providers } from './providers'
import { Shell, PageHeader } from '@/components/shell'
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

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 650, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value.toLocaleString()}
      </div>
      {hint && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', margin: '0 0 10px' }}>
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {children}
      </div>
    </section>
  )
}

function Overview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.get<{ data: Metrics }>('/admin/metrics').then((r) => r.data),
  })

  if (isLoading) return <p style={{ color: 'var(--ink-3)' }}>Loading metrics…</p>
  if (error || !data) {
    return <p style={{ color: 'var(--danger)' }}>Could not load metrics.</p>
  }

  return (
    <>
      <Section title="Users">
        <Stat label="Total accounts" value={data.users.total} />
        <Stat label="Email verified" value={data.users.verified} />
        <Stat label="Completed onboarding" value={data.users.onboarded} />
        <Stat label="New this week" value={data.users.newLast7Days} />
      </Section>

      <Section title="Content">
        <Stat label="Subjects" value={data.content.subjects} hint="Seeded syllabus" />
        <Stat
          label="Past questions"
          value={data.content.pastQuestions}
          hint={
            data.pastQuestionsByExam.length > 0
              ? data.pastQuestionsByExam
                  .map((e) => `${e.exam.toUpperCase()} ${e.count}`)
                  .join(' · ')
              : 'None uploaded yet'
          }
        />
        <Stat label="Quizzes generated" value={data.content.quizzesGenerated} />
      </Section>

      <Section title="Activity">
        <Stat label="Study sessions" value={data.activity.studySessions} />
        <Stat label="Quiz attempts" value={data.activity.quizAttempts} />
        <Stat label="Marathon runs" value={data.activity.marathonRuns} />
        <Stat label="XP awarded" value={data.activity.xpAwarded} />
      </Section>
    </>
  )
}

export default function AdminHomePage() {
  return (
    <Providers>
      <Shell>
        <PageHeader title="Overview" subtitle="Platform health at a glance." />
        <Overview />
      </Shell>
    </Providers>
  )
}
