'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { QuestionImage } from '@/components/common/question-image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/common/loading-state'

interface QuizOption {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
}

interface QuizQuestion {
  id: string
  stem: string
  options: QuizOption[]
  correctOptionId: 'A' | 'B' | 'C' | 'D'
  explanation: string
  topicSlug: string
  difficulty: string
  /** Diagram the question depends on (past-question bank). */
  imageUrl?: string
}

interface QuizData {
  id: string
  type: string
  difficulty: string
  topicRef?: { subjectSlug: string; topicSlug: string | null }
  questions: QuizQuestion[]
}

interface AnswerResult {
  questionId: string
  selectedOptionId: 'A' | 'B' | 'C' | 'D'
  correctOptionId: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  timeSpentSec: number
}

interface AttemptData {
  id: string
  score: number
  correctCount: number
  totalCount: number
  durationSec: number
  xpAwarded: number
  answers: AnswerResult[]
  byTopic: Record<string, { correct: number; total: number }>
}

interface ResultData {
  attempt: AttemptData
  quiz: QuizData
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

function QuestionReviewItem({
  question,
  result,
  index,
}: {
  question: QuizQuestion
  result: AnswerResult
  index: number
}) {
  const t = useTranslations('quiz')
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        border: '1px solid var(--color-rule)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          backgroundColor: 'var(--color-card)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: result.isCorrect
              ? 'var(--color-success, #22c55e)'
              : 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: 'white',
          }}
        >
          {result.isCorrect ? '+' : '-'}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--color-ink)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {index + 1}. {question.stem}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-ink-3)',
            flexShrink: 0,
          }}
        >
          {expanded ? 'Hide' : 'Show'}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            padding: '0 16px 16px',
            backgroundColor: 'var(--color-paper-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Question stem */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--color-ink)',
              lineHeight: 1.6,
              paddingTop: 12,
            }}
          >
            {question.stem}
          </p>

          {question.imageUrl && <QuestionImage url={question.imageUrl} compact />}

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {question.options.map((opt) => {
              const isSelected = opt.id === result.selectedOptionId
              const isCorrect = opt.id === result.correctOptionId
              const isWrongSelection = isSelected && !isCorrect

              let bg = 'transparent'
              let borderColor = 'var(--color-rule)'
              let textColor = 'var(--color-ink-2)'

              if (isCorrect) {
                bg = 'rgba(34, 197, 94, 0.12)'
                borderColor = 'rgba(34, 197, 94, 0.5)'
                textColor = 'var(--color-ink)'
              } else if (isWrongSelection) {
                bg = 'rgba(239, 68, 68, 0.1)'
                borderColor = 'var(--color-danger)'
                textColor = 'var(--color-ink)'
              }

              return (
                <div
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${borderColor}`,
                    backgroundColor: bg,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: isCorrect
                        ? 'rgba(34, 197, 94, 0.9)'
                        : isWrongSelection
                        ? 'var(--color-danger)'
                        : 'var(--color-ink-3)',
                      width: 16,
                      flexShrink: 0,
                    }}
                  >
                    {opt.id}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      color: textColor,
                      lineHeight: 1.5,
                    }}
                  >
                    {opt.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Explanation */}
          <div
            style={{
              backgroundColor: 'var(--color-paper-3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              borderLeft: '3px solid var(--color-accent)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-ink-2)',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {t('explanation')}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--color-ink)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {question.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('quiz')
  const quizId = params.quizId as string
  const attemptId = params.attemptId as string

  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    let cancelled = false

    api
      .get<{ data: ResultData }>(`/quizzes/attempts/${attemptId}`)
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load results')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attemptId])

  async function handlePracticeAgain() {
    if (!data) return
    setRegenerating(true)
    try {
      // A whole-subject quiz has no topic of its own; its questions each carry
      // their own, so only a topic quiz falls back to the first question's.
      const wholeSubject = data.quiz.type === 'subject' && !data.quiz.topicRef?.topicSlug
      const topicSlug = data.quiz.topicRef?.topicSlug || data.quiz.questions[0]?.topicSlug || ''
      const subjectSlug = data.quiz.topicRef?.subjectSlug ?? ''
      const result = await api.post<{ data: { quizId: string } }>('/quizzes/generate', {
        subjectSlug,
        ...(wholeSubject ? {} : { topicSlug }),
        type: wholeSubject ? 'subject' : 'topic',
        difficulty: data.quiz.difficulty,
        questionCount: data.quiz.questions.length,
      })
      router.push(`/quizzes/${result.data.quizId}`)
    } catch {
      setRegenerating(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--color-danger)',
            marginBottom: 16,
          }}
        >
          {error ?? 'Results not found'}
        </p>
        <Button variant="secondary" onClick={() => router.push('/quizzes')}>
          {t('backToQuizzes')}
        </Button>
      </div>
    )
  }

  const { attempt, quiz } = data
  const topicSlugsSet = new Set(quiz.questions.map((q) => q.topicSlug))
  const topicSlugs = Array.from(topicSlugsSet)
  const isMultiTopic = topicSlugs.length > 1

  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 0 60px',
      }}
    >
      {/* Score hero */}
      <div
        style={{
          textAlign: 'center',
          padding: '40px 24px 32px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 72,
            fontWeight: 500,
            color:
              attempt.score >= 70
                ? 'var(--color-success, #22c55e)'
                : attempt.score >= 50
                ? 'var(--color-accent)'
                : 'var(--color-danger)',
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          {t('score', { score: attempt.score })}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            color: 'var(--color-ink-2)',
            marginBottom: 16,
          }}
        >
          {attempt.correctCount} of {attempt.totalCount} correct in{' '}
          {formatDuration(attempt.durationSec)}
        </p>

        {attempt.xpAwarded > 0 && (
          <div style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <Badge variant="accent">{t('xpEarned', { xp: attempt.xpAwarded })}</Badge>
          </div>
        )}
      </div>

      {/* Topic breakdown (only for multi-topic quizzes) */}
      {isMultiTopic && Object.keys(attempt.byTopic).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-ink-2)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
            }}
          >
            By Topic
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(attempt.byTopic).map(([topic, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100)
              return (
                <div
                  key={topic}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-rule)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--color-ink)',
                        marginBottom: 4,
                      }}
                    >
                      {topic.replace(/-/g, ' ')}
                    </p>
                    <div
                      style={{
                        height: 3,
                        backgroundColor: 'var(--color-paper-3)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor:
                            pct >= 70
                              ? 'var(--color-success, #22c55e)'
                              : pct >= 50
                              ? 'var(--color-accent)'
                              : 'var(--color-danger)',
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--color-ink-2)',
                      flexShrink: 0,
                    }}
                  >
                    {stats.correct}/{stats.total}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Question review */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-ink-2)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 10,
          }}
        >
          Question Review
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {quiz.questions.map((question, idx) => {
            const result = attempt.answers.find((a) => a.questionId === question.id)
            if (!result) return null
            return (
              <QuestionReviewItem
                key={question.id}
                question={question}
                result={result}
                index={idx}
              />
            )
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Button variant="accent" onClick={handlePracticeAgain} disabled={regenerating}>
          {regenerating ? 'Generating...' : 'Practice again'}
        </Button>
        <Button variant="secondary" onClick={() => router.push('/roadmap')}>
          Back to roadmap
        </Button>
      </div>
    </div>
  )
}
