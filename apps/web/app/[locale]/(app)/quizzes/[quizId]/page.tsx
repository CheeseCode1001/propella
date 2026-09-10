'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/common/loading-state'
import { cn } from '@/lib/utils/cn'

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
}

interface QuizData {
  id: string
  type: string
  difficulty: string
  mode: 'study' | 'exam'
  topicRef?: { subjectSlug: string; topicSlug: string }
  questions: QuizQuestion[]
}

type AnswerMap = Map<string, 'A' | 'B' | 'C' | 'D'>

export default function QuizEnginePage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('quiz')
  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>(new Map())
  const [submitting, setSubmitting] = useState(false)
  // Study mode marks a question as revealed the moment it is answered.
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  // Timer per question. Seeded in the mount effect below rather than during
  // render, since reading the clock while rendering is impure.
  const questionStartRef = useRef<number>(0)
  const questionTimesRef = useRef<Map<string, number>>(new Map())
  const sessionStartRef = useRef<number>(0)

  useEffect(() => {
    const now = Date.now()
    questionStartRef.current = now
    sessionStartRef.current = now

    let cancelled = false

    async function init() {
      try {
        // First: get the quiz questions. We need the quiz to exist first.
        // The generate endpoint already created the quiz; we need to fetch it.
        // We start an attempt on mount.
        const attemptRes = await api.post<{ data: { attemptId: string; quizId: string } }>(
          `/quizzes/${quizId}/attempt`,
        )
        if (cancelled) return

        setAttemptId(attemptRes.data.attemptId)

        // We need the quiz data (questions). Fetch it via attempt results endpoint or keep from generate.
        // Actually we only have the list endpoint. But the getAttempt endpoint returns quiz too.
        // Instead of a separate GET quiz endpoint, we'll use the attempt GET to get the quiz.
        // But the attempt was just created — let's call getAttempt.
        const attemptData = await api.get<{
          data: { quiz: QuizData; attempt: { id: string } }
        }>(`/quizzes/attempts/${attemptRes.data.attemptId}`)
        if (cancelled) return

        setQuiz(attemptData.data.quiz)
        sessionStartRef.current = Date.now()
        questionStartRef.current = Date.now()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load quiz')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [quizId])

  const isStudyMode = quiz?.mode === 'study'

  const handleSelectAnswer = useCallback(
    (questionId: string, optionId: 'A' | 'B' | 'C' | 'D') => {
      // In study mode an answered question is final - changing it after seeing
      // the explanation would make the score meaningless.
      if (isStudyMode && revealed.has(questionId)) return

      setAnswers((prev) => {
        const next = new Map(prev)
        next.set(questionId, optionId)
        return next
      })

      if (isStudyMode) {
        setRevealed((prev) => new Set(prev).add(questionId))
      }
    },
    [isStudyMode, revealed],
  )

  function recordQuestionTime(questionId: string) {
    const now = Date.now()
    const elapsed = Math.round((now - questionStartRef.current) / 1000)
    questionTimesRef.current.set(questionId, elapsed)
    questionStartRef.current = now
  }

  function handleNext() {
    if (!quiz) return
    const currentQuestion = quiz.questions[currentIndex]
    if (currentQuestion) {
      recordQuestionTime(currentQuestion.id)
    }
    setCurrentIndex((i) => Math.min(i + 1, quiz.questions.length - 1))
  }

  function handlePrev() {
    if (!quiz) return
    const currentQuestion = quiz.questions[currentIndex]
    if (currentQuestion) {
      recordQuestionTime(currentQuestion.id)
    }
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }

  async function handleSubmit() {
    if (!quiz || !attemptId) return

    const currentQuestion = quiz.questions[currentIndex]
    if (currentQuestion) {
      recordQuestionTime(currentQuestion.id)
    }

    setSubmitting(true)

    const durationSec = Math.round((Date.now() - sessionStartRef.current) / 1000)

    const answersPayload = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers.get(q.id) ?? 'A',
      timeSpentSec: questionTimesRef.current.get(q.id) ?? 0,
    }))

    try {
      await api.post(`/quizzes/attempts/${attemptId}/submit`, {
        quizId,
        answers: answersPayload,
        durationSec,
      })
      router.push(`/quizzes/${quizId}/results/${attemptId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error || !quiz) {
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
          {error ?? 'Quiz not found'}
        </p>
        <Button variant="secondary" onClick={() => router.push('/quizzes')}>
          {t('backToQuizzes')}
        </Button>
      </div>
    )
  }

  const totalQuestions = quiz.questions.length
  const currentQuestion = quiz.questions[currentIndex]!
  const selectedOption = answers.get(currentQuestion.id)
  const isRevealed = isStudyMode && revealed.has(currentQuestion.id)
  const answeredCorrectly = selectedOption === currentQuestion.correctOptionId
  const progressPct = ((currentIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentIndex === totalQuestions - 1
  const answeredCount = answers.size

  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 0 40px',
      }}
    >
      {/* Progress header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-ink-3)',
            }}
          >
            {t('question', { current: currentIndex + 1, total: totalQuestions })}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-ink-3)',
            }}
          >
            {answeredCount} answered
          </span>
        </div>

        {/* Progress bar */}
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
              width: `${progressPct}%`,
              backgroundColor: 'var(--color-accent)',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Question stem */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--color-ink)',
          lineHeight: 1.4,
          marginBottom: 24,
        }}
      >
        {currentQuestion.stem}
      </h2>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOption === option.id
          const isCorrectOption = option.id === currentQuestion.correctOptionId

          // Exam mode never colours the options - feedback waits for submission.
          let accent = 'var(--color-accent)'
          let tint = 'var(--color-accent-tint)'
          let highlighted = isSelected

          if (isRevealed) {
            if (isCorrectOption) {
              accent = 'var(--color-success)'
              tint = 'var(--color-success-tint)'
              highlighted = true
            } else if (isSelected) {
              accent = 'var(--color-danger)'
              tint = 'var(--color-danger-tint)'
              highlighted = true
            } else {
              highlighted = false
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
              disabled={isRevealed}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                border: highlighted
                  ? `1.5px solid ${accent}`
                  : '1.5px solid var(--color-rule-2)',
                borderLeft: highlighted
                  ? `4px solid ${accent}`
                  : '4px solid transparent',
                backgroundColor: highlighted ? tint : 'var(--color-paper-2)',
                cursor: isRevealed ? 'default' : 'pointer',
                opacity: isRevealed && !highlighted ? 0.55 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!highlighted && !isRevealed) {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--color-paper-3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!highlighted && !isRevealed) {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--color-paper-2)'
                }
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: highlighted ? accent : 'var(--color-ink-3)',
                  width: 20,
                  flexShrink: 0,
                }}
              >
                {option.id}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  color: isSelected ? 'var(--color-ink)' : 'var(--color-ink)',
                  lineHeight: 1.5,
                }}
              >
                {option.text}
              </span>
            </button>
          )
        })}
      </div>

      {/* Study-mode explanation */}
      {isRevealed && (
        <div
          style={{
            marginTop: -16,
            marginBottom: 32,
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${
              answeredCorrectly ? 'var(--color-success)' : 'var(--color-danger)'
            }40`,
            backgroundColor: answeredCorrectly
              ? 'var(--color-success-tint)'
              : 'var(--color-danger-tint)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 600,
              color: answeredCorrectly ? 'var(--color-success)' : 'var(--color-danger)',
              marginBottom: 6,
            }}
          >
            {answeredCorrectly ? t('correct') : t('incorrect')}
            {!answeredCorrectly && (
              <span style={{ fontWeight: 400, color: 'var(--color-ink-2)' }}>
                {' \u00b7 '}
                {t('correctAnswer')}: {currentQuestion.correctOptionId}
              </span>
            )}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              lineHeight: 1.6,
              color: 'var(--color-ink-2)',
            }}
          >
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={submitting || answeredCount === 0}
          >
            {submitting ? 'Submitting...' : t('submitQuiz')}
          </Button>
        ) : (
          <Button variant="default" onClick={handleNext}>
            Next
          </Button>
        )}
      </div>

      {/* Question dot navigation */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 24,
          justifyContent: 'center',
        }}
      >
        {quiz.questions.map((q, idx) => {
          const isAnswered = answers.has(q.id)
          const isCurrent = idx === currentIndex
          return (
            <button
              key={q.id}
              onClick={() => {
                const curr = quiz.questions[currentIndex]
                if (curr) recordQuestionTime(curr.id)
                setCurrentIndex(idx)
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: isCurrent
                  ? '2px solid var(--color-accent)'
                  : '1.5px solid var(--color-rule)',
                backgroundColor: isAnswered
                  ? 'var(--color-accent)'
                  : isCurrent
                  ? 'var(--color-accent-tint)'
                  : 'var(--color-paper-2)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                color: isAnswered
                  ? 'white'
                  : isCurrent
                  ? 'var(--color-accent)'
                  : 'var(--color-ink-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
