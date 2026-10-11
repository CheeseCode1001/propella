'use client'
import { useParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface AttemptResult {
  attempt: {
    id: string
    score: number
    xpAwarded: number
    durationSec: number
    byTopic: Array<{ topicSlug: string; correct: number; total: number; masteryDelta: number }>
    completedAt?: string
  }
  quiz: {
    id: string
    questionCount: number
    questions: Array<{
      id: string
      stem: string
      options: Array<{ id: string; text: string }>
      correctOptionId: string
      explanation: string
      topicSlug: string
      difficulty: string
    }>
    timeLimit: number
  }
}

export default function MockResultsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('mocks')
  const attemptId = params.attemptId as string
  const mockId = params.mockId as string

  const { data, isLoading } = useQuery({
    queryKey: ['mock-result', attemptId],
    queryFn: () =>
      api
        .get<{ data: AttemptResult }>(`/mocks/attempts/${attemptId}`)
        .then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
        <Skeleton className="h-12 w-48 mb-4" />
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!data) return null

  const { attempt, quiz } = data
  const scoreColor =
    attempt.score >= 60
      ? 'var(--color-success)'
      : attempt.score >= 40
        ? 'var(--color-warning)'
        : 'var(--color-danger)'

  function formatDuration(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m} min`
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}
        >
          Exam results
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56,
            fontWeight: 500,
            color: scoreColor,
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {t('score', { score: attempt.score })}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-3)' }}>
          {t('questions', { count: quiz.questionCount })} · {formatDuration(attempt.durationSec)} taken ·{' '}
          <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
            +{attempt.xpAwarded} XP
          </span>
        </p>
      </div>

      {/* Score summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Card>
          <CardContent style={{ paddingTop: 20 }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              Score
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32,
                fontWeight: 500,
                color: scoreColor,
              }}
            >
              {t('score', { score: attempt.score })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ paddingTop: 20 }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              Time taken
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32,
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              {formatDuration(attempt.durationSec)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ paddingTop: 20 }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              XP earned
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32,
                fontWeight: 500,
                color: 'var(--color-accent)',
              }}
            >
              +{attempt.xpAwarded}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject breakdown */}
      {attempt.byTopic.length > 0 && (
        <Card style={{ marginBottom: 32 }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Topic breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {attempt.byTopic.map((t) => {
                const pct = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0
                return (
                  <div key={t.topicSlug} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        color: 'var(--color-ink-2)',
                        width: 160,
                        flexShrink: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.topicSlug}
                    </p>
                    <div
                      style={{
                        flex: 1,
                        height: 6,
                        backgroundColor: 'var(--color-paper-3)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor:
                            pct >= 60
                              ? 'var(--color-success)'
                              : pct >= 40
                                ? 'var(--color-warning)'
                                : 'var(--color-danger)',
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--color-ink-3)',
                        flexShrink: 0,
                        width: 48,
                        textAlign: 'right',
                      }}
                    >
                      {t.correct}/{t.total}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="accent" onClick={() => router.push('/mocks')}>
          Back to mocks
        </Button>
        <Button variant="secondary" onClick={() => router.push('/dashboard')}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
