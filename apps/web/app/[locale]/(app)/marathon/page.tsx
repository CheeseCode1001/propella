'use client'
import { useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { useMarathonStore, useMarathonActive } from '@/lib/stores/marathon-store'

const DURATION_OPTIONS = [30, 60, 90, 120]
const POMODORO_OPTIONS = [
  { length: 25, label: '25 min', requiresPlan: false },
  { length: 50, label: '50 min', requiresPlan: true },
]

const SUBJECT_SLUGS = [
  { slug: 'english', name: 'English' },
  { slug: 'mathematics', name: 'Mathematics' },
  { slug: 'physics', name: 'Physics' },
  { slug: 'chemistry', name: 'Chemistry' },
  { slug: 'biology', name: 'Biology' },
  { slug: 'government', name: 'Government' },
  { slug: 'economics', name: 'Economics' },
  { slug: 'literature', name: 'Literature' },
]

function Pill({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 18px',
        borderRadius: 999,
        border: active ? '2px solid var(--color-accent)' : '2px solid var(--color-rule-2)',
        backgroundColor: active ? 'var(--color-accent-tint)' : 'var(--color-paper)',
        color: active ? 'var(--color-accent)' : disabled ? 'var(--color-ink-3)' : 'var(--color-ink-2)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function SubjectChip({
  name,
  active,
  onClick,
}: {
  name: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--radius-sm)',
        border: active ? '2px solid var(--color-accent)' : '2px solid var(--color-rule)',
        backgroundColor: active ? 'var(--color-accent-tint)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-ink-2)',
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {name}
    </button>
  )
}

export default function MarathonPage() {
  const router = useRouter()
  const t = useTranslations('marathon')
  const user = useAuthStore((s) => s.user)
  const isScholar = user?.plan === 'scholar'

  const [duration, setDuration] = useState(60)
  const [pomodoroLength, setPomodoroLength] = useState(25)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['english', 'mathematics'])
  const [isStarting, setIsStarting] = useState(false)
  const startMarathon = useMarathonStore((s) => s.start)
  const marathonActive = useMarathonActive()

  const { data: historyData } = useQuery({
    queryKey: ['marathon-history'],
    queryFn: () =>
      api.get<{
        data: {
          runs: Array<{
            id: string
            status: string
            startedAt: string
            endedAt?: string
            plannedDurationMin: number
            actualDurationSec: number
            pomodorosCompleted: number
            xpAwarded: number
          }>
        }
      }>('/marathon').then((r) => r.data.runs),
  })

  function toggleSubject(slug: string) {
    setSelectedSubjects((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  async function handleStart() {
    if (selectedSubjects.length === 0) return
    setIsStarting(true)
    try {
      const result = await api.post<{ data: { runId: string } }>('/marathon/start', {
        plannedDurationMin: duration,
        pomodoroLength,
        subjectSlugs: selectedSubjects,
      })
      // The run lives in the floating widget now, so stay inside the app shell
      // instead of taking over the screen with a dedicated page.
      startMarathon({
        runId: result.data.runId,
        plannedDurationMin: duration,
        pomodoroLength,
        subjectSlugs: selectedSubjects,
      })
      router.push('/dashboard')
    } catch {
      setIsStarting(false)
    }
  }

  return (
    <div style={{ margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 500,
            color: 'var(--color-ink)',
            marginBottom: 8,
          }}
        >
          Marathon mode
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-ink-2)' }}>
          Lock in for a long, uninterrupted study run. Earn 2x XP.
        </p>
      </div>

      {/* Config card */}
      <Card style={{ marginBottom: 32 }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Configure your session
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Duration */}
          <div style={{ marginBottom: 28 }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
              }}
            >
              Duration
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {DURATION_OPTIONS.map((d) => (
                <Pill key={d} active={duration === d} onClick={() => setDuration(d)}>
                  {d} min
                </Pill>
              ))}
            </div>
          </div>

          {/* Pomodoro length */}
          <div style={{ marginBottom: 28 }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
              }}
            >
              Pomodoro length
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {POMODORO_OPTIONS.map((opt) => (
                <Pill
                  key={opt.length}
                  active={pomodoroLength === opt.length}
                  disabled={opt.requiresPlan && !isScholar}
                  onClick={() => {
                    if (!opt.requiresPlan || isScholar) setPomodoroLength(opt.length)
                  }}
                >
                  {opt.label}
                  {opt.requiresPlan && !isScholar ? ' (Scholar)' : ''}
                </Pill>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div style={{ marginBottom: 28 }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
              }}
            >
              Subjects to cover
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUBJECT_SLUGS.map((s) => (
                <SubjectChip
                  key={s.slug}
                  name={s.name}
                  active={selectedSubjects.includes(s.slug)}
                  onClick={() => toggleSubject(s.slug)}
                />
              ))}
            </div>
            {selectedSubjects.length === 0 && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'var(--color-danger)',
                  marginTop: 8,
                }}
              >
                Select at least one subject to begin.
              </p>
            )}
          </div>

          <Button
            variant="accent"
            size="lg"
            onClick={handleStart}
            disabled={isStarting || marathonActive || selectedSubjects.length === 0}
          >
            {isStarting
              ? 'Starting...'
              : marathonActive
              ? 'Marathon already running'
              : 'Begin marathon'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent runs */}
      {historyData && historyData.length > 0 && (
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 16,
            }}
          >
            Recent sessions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historyData.slice(0, 5).map((run) => (
              <div
                key={run.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-rule)',
                  backgroundColor: 'var(--color-card)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--color-ink)',
                    }}
                  >
                    {t('pomodorosCompleted', { count: run.pomodorosCompleted })}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--color-ink-3)',
                      marginTop: 2,
                    }}
                  >
                    {new Date(run.startedAt).toLocaleDateString()} ·{' '}
                    {Math.round(run.actualDurationSec / 60)} min
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-accent)',
                  }}
                >
                  +{run.xpAwarded} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
