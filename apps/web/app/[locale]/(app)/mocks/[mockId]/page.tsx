'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

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

interface MockData {
  mockId: string
  questionCount: number
  timeLimit: number
  type: string
  createdAt: string
}

interface AttemptData {
  attemptId: string
  startedAt: string
}

interface FullMockData {
  quiz: {
    id: string
    questionCount: number
    questions: QuizQuestion[]
    timeLimit: number
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatCountdown(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

export default function MockExamPage() {
  const params = useParams()
  const router = useRouter()
  const mockId = params.mockId as string

  const [attempt, setAttempt] = useState<AttemptData | null>(null)
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [started, setStarted] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch mock info
  const { data: mockData, isLoading: mockLoading } = useQuery({
    queryKey: ['mock', mockId],
    queryFn: () =>
      api
        .get<{ data: MockData }>(`/mocks/${mockId}`)
        .catch(() => null),
  })

  // Fetch full quiz data (after attempt started)
  const { data: fullData, isLoading: questionsLoading } = useQuery({
    queryKey: ['mock-questions', attempt?.attemptId],
    queryFn: () =>
      api
        .get<{ data: FullMockData['quiz'] }>(`/mocks/attempts/${attempt!.attemptId}`)
        .then((r) => ({ quiz: r.data })),
    enabled: !!attempt,
  })

  async function handleStart() {
    const result = await api.post<{ data: AttemptData }>(`/mocks/${mockId}/attempt`)
    setAttempt(result.data)
    setStarted(true)
    startTimeRef.current = Date.now()
  }

  // Countdown timer
  useEffect(() => {
    if (!started || !fullData) return

    const limit = fullData.quiz.timeLimit ?? 7200
    // Intentional: the clock starts only once the paper is loaded and the
    // candidate has begun, which is not knowable during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(limit)

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!)
          void handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, fullData])

  async function handleSubmit() {
    if (!attempt || !fullData || isSubmitting) return
    setIsSubmitting(true)
    if (intervalRef.current) clearInterval(intervalRef.current)

    const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const formattedAnswers = fullData.quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id] ?? 'A',
      timeSpentSec: 0,
    }))

    try {
      await api.post(`/mocks/attempts/${attempt.attemptId}/submit`, {
        quizId: fullData.quiz.id,
        answers: formattedAnswers,
        durationSec,
      })
      router.push(`/mocks/${mockId}/results/${attempt.attemptId}`)
    } catch {
      setIsSubmitting(false)
    }
  }

  function selectAnswer(questionId: string, optionId: 'A' | 'B' | 'C' | 'D') {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  if (mockLoading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-48 mb-8" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  // Start screen
  if (!started) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 24,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 500,
            color: 'var(--color-ink)',
          }}
        >
          Mock Exam
        </h1>

        <div
          style={{
            display: 'flex',
            gap: 32,
            padding: '24px 32px',
            border: '1px solid var(--color-rule)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-card)',
          }}
        >
          <div>
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
              Questions
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              {mockData?.data?.questionCount ?? '—'}
            </p>
          </div>
          <div>
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
              Time allowed
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              {mockData?.data?.timeLimit
                ? formatCountdown(mockData.data.timeLimit)
                : '—'}
            </p>
          </div>
        </div>

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-3)' }}>
          Once you begin, the timer starts. Answer all questions and submit before time runs out.
        </p>
        <Button variant="accent" size="lg" onClick={handleStart}>
          Begin exam
        </Button>
      </div>
    )
  }

  if (questionsLoading || !fullData) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const questions = fullData.quiz.questions
  const currentQuestion = questions[currentIdx]
  const answeredCount = Object.keys(answers).length

  if (!currentQuestion) return null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          marginBottom: 24,
          borderBottom: '1px solid var(--color-rule)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-ink-3)',
            }}
          >
            Question {currentIdx + 1} of {questions.length}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-ink-3)',
            }}
          >
            {answeredCount} answered
          </p>
        </div>

        {/* Countdown */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 500,
            color:
              timeLeft !== null && timeLeft < 300
                ? 'var(--color-danger)'
                : 'var(--color-ink)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {timeLeft !== null ? formatCountdown(timeLeft) : '—'}
        </p>

        <Button
          variant="accent"
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit exam'}
        </Button>
      </div>

      {/* Question navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(i)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              border: i === currentIdx ? '2px solid var(--color-accent)' : '1px solid var(--color-rule)',
              backgroundColor: answers[q.id]
                ? 'var(--color-accent-tint)'
                : i === currentIdx
                  ? 'var(--color-paper-3)'
                  : 'var(--color-paper)',
              color: i === currentIdx ? 'var(--color-accent)' : 'var(--color-ink-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: answers[q.id] ? 600 : 400,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      <div
        style={{
          padding: 28,
          border: '1px solid var(--color-rule)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-card)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-start' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--color-ink-3)',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            {currentIdx + 1}.
          </span>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              color: 'var(--color-ink)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {currentQuestion.stem}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 28 }}>
          {currentQuestion.options.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected
                    ? '2px solid var(--color-accent)'
                    : '1px solid var(--color-rule-2)',
                  backgroundColor: isSelected ? 'var(--color-accent-tint)' : 'var(--color-paper)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  transition: 'all 0.1s',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                    flexShrink: 0,
                  }}
                >
                  {opt.id}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    color: isSelected ? 'var(--color-ink)' : 'var(--color-ink-2)',
                    lineHeight: 1.5,
                  }}
                >
                  {opt.text}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <Button
          variant="secondary"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
          disabled={currentIdx === questions.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
