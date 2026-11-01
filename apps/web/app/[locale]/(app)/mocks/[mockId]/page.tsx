'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { QuestionImage } from '@/components/common/question-image'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PauseCircle, Play, Flag, Timer1 } from 'iconsax-reactjs'
import { RotateCcw, LogOut, CheckCircle2 } from 'lucide-react'

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

interface SavedAnswerItem {
  questionId: string
  selectedOptionId: 'A' | 'B' | 'C' | 'D'
  timeSpentSec?: number
}

interface ActiveAttemptInfo {
  attemptId: string
  startedAt: string
  durationSec: number
  answers: SavedAnswerItem[]
}

interface MockData {
  mockId: string
  questionCount: number
  timeLimit: number
  type: string
  createdAt: string
  activeAttempt?: ActiveAttemptInfo | null
}

interface AttemptData {
  attemptId: string
  startedAt: string
  durationSec?: number
  answers?: SavedAnswerItem[]
  resumed?: boolean
}

interface FullMockData {
  quiz: {
    id: string
    questionCount: number
    questions: QuizQuestion[]
    timeLimit: number
  }
}

interface LocalMockProgress {
  attemptId: string
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>
  flagged: string[]
  currentIdx: number
  elapsedSec: number
  updatedAt: number
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatCountdown(sec: number): string {
  const safe = Math.max(0, sec)
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

function getStorageKey(mockId: string): string {
  return `propella-mock-progress-${mockId}`
}

function readLocalProgress(mockId: string): LocalMockProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(getStorageKey(mockId))
    if (!raw) return null
    return JSON.parse(raw) as LocalMockProgress
  } catch {
    return null
  }
}

function writeLocalProgress(mockId: string, progress: LocalMockProgress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getStorageKey(mockId), JSON.stringify(progress))
  } catch {
    // ignore storage quota errors
  }
}

function clearLocalProgress(mockId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(getStorageKey(mockId))
  } catch {
    // ignore
  }
}

export default function MockExamPage() {
  const params = useParams()
  const router = useRouter()
  const mockId = params.mockId as string

  const [attempt, setAttempt] = useState<AttemptData | null>(null)
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [started, setStarted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch mock info + any active unfinished attempt from the server
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
        .get<{ data: FullMockData }>(`/mocks/attempts/${attempt!.attemptId}`)
        .then((r) => ({ quiz: r.data.quiz })),
    enabled: !!attempt,
  })

  // Sync progress to localStorage & backend
  const persistProgress = useCallback(
    async (
      overrideAnswers?: Record<string, 'A' | 'B' | 'C' | 'D'>,
      overrideIdx?: number,
      overrideFlagged?: Set<string>,
      overrideElapsed?: number,
      syncToServer = true,
    ) => {
      if (!attempt) return
      const currentAnswers = overrideAnswers ?? answers
      const idx = overrideIdx ?? currentIdx
      const flags = overrideFlagged ?? flagged
      const elapsed = overrideElapsed ?? elapsedSec

      writeLocalProgress(mockId, {
        attemptId: attempt.attemptId,
        answers: currentAnswers,
        flagged: Array.from(flags),
        currentIdx: idx,
        elapsedSec: elapsed,
        updatedAt: Date.now(),
      })

      if (syncToServer) {
        try {
          const payload = Object.entries(currentAnswers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
            timeSpentSec: 0,
          }))
          await api.patch(`/mocks/attempts/${attempt.attemptId}/progress`, {
            answers: payload,
            durationSec: elapsed,
          })
          setLastSavedNotice('Progress saved')
        } catch {
          // Local storage still preserves state if offline
        }
      }
    },
    [attempt, answers, currentIdx, flagged, elapsedSec, mockId],
  )

  // Check if there is a saved/paused attempt to display on the pre-start screen
  const savedLocal = typeof window !== 'undefined' ? readLocalProgress(mockId) : null
  const serverActiveAttempt = mockData?.data?.activeAttempt ?? null
  const hasPausedSession = Boolean(serverActiveAttempt || savedLocal)
  const pausedAnsweredCount = savedLocal
    ? Object.keys(savedLocal.answers).length
    : serverActiveAttempt?.answers?.length ?? 0
  const pausedElapsedSec = Math.max(
    savedLocal?.elapsedSec ?? 0,
    serverActiveAttempt?.durationSec ?? 0,
  )

  async function handleStartOrResume(forceRestart = false) {
    if (forceRestart) {
      clearLocalProgress(mockId)
      setAnswers({})
      setFlagged(new Set())
      setCurrentIdx(0)
      setElapsedSec(0)
    }

    const result = await api.post<{ data: AttemptData }>(`/mocks/${mockId}/attempt`, {
      forceRestart,
    })
    const attemptInfo = result.data
    setAttempt(attemptInfo)

    if (!forceRestart) {
      // Restore answers from localStorage or server attempt
      const local = readLocalProgress(mockId)
      const restoredAnswers: Record<string, 'A' | 'B' | 'C' | 'D'> = {}
      if (Array.isArray(attemptInfo.answers)) {
        for (const item of attemptInfo.answers) {
          if (item?.questionId && item?.selectedOptionId) {
            restoredAnswers[item.questionId] = item.selectedOptionId
          }
        }
      }
      if (local && local.attemptId === attemptInfo.attemptId) {
        Object.assign(restoredAnswers, local.answers)
        setFlagged(new Set(local.flagged ?? []))
        setCurrentIdx(local.currentIdx ?? 0)
      }
      setAnswers(restoredAnswers)
      const prevElapsed = Math.max(
        local?.attemptId === attemptInfo.attemptId ? local.elapsedSec : 0,
        attemptInfo.durationSec ?? 0,
      )
      setElapsedSec(prevElapsed)
    }

    setIsPaused(false)
    setStarted(true)
  }

  // Initialize timeLeft when paper loads
  useEffect(() => {
    if (!started || !fullData) return
    const limit = fullData.quiz.timeLimit ?? 7200
    const remaining = Math.max(1, limit - elapsedSec)
    setTimeLeft(remaining)
    // Ensure currentIdx is within bounds
    if (currentIdx >= fullData.quiz.questions.length) {
      setCurrentIdx(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, fullData])

  // Countdown timer (pauses cleanly when isPaused is true)
  useEffect(() => {
    if (!started || !fullData || isPaused || isSubmitting) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setElapsedSec((prevElapsed) => {
        const nextElapsed = prevElapsed + 1
        // Every 15 seconds, auto-save progress to localStorage & server
        if (nextElapsed % 15 === 0) {
          void persistProgress(undefined, undefined, undefined, nextElapsed, true)
        } else {
          void persistProgress(undefined, undefined, undefined, nextElapsed, false)
        }
        return nextElapsed
      })

      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
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
  }, [started, fullData, isPaused, isSubmitting, persistProgress])

  // Save on tab close / visibility change so accidental navigation never loses progress
  useEffect(() => {
    if (!started || !attempt) return
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        void persistProgress(undefined, undefined, undefined, undefined, true)
      }
    }
    function handleBeforeUnload() {
      void persistProgress(undefined, undefined, undefined, undefined, false)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [started, attempt, persistProgress])

  async function handlePauseExam() {
    setIsPaused(true)
    setIsSavingProgress(true)
    await persistProgress(undefined, undefined, undefined, undefined, true)
    setIsSavingProgress(false)
  }

  async function handleSaveAndExit() {
    setIsSavingProgress(true)
    await persistProgress(undefined, undefined, undefined, undefined, true)
    setIsSavingProgress(false)
    router.push('/mocks')
  }

  async function handleSubmit() {
    if (!attempt || !fullData || isSubmitting) return
    setIsSubmitting(true)
    if (intervalRef.current) clearInterval(intervalRef.current)

    // Only submit questions the candidate actually answered
    const formattedAnswers = fullData.quiz.questions
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id]!,
        timeSpentSec: 0,
      }))

    try {
      await api.post(`/mocks/attempts/${attempt.attemptId}/submit`, {
        quizId: fullData.quiz.id,
        answers: formattedAnswers,
        durationSec: elapsedSec,
      })
      clearLocalProgress(mockId)
      router.push(`/mocks/${mockId}/results/${attempt.attemptId}`)
    } catch {
      setIsSubmitting(false)
    }
  }

  function selectAnswer(questionId: string, optionId: 'A' | 'B' | 'C' | 'D') {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionId }
      void persistProgress(next, currentIdx, flagged, elapsedSec, true)
      return next
    })
  }

  function toggleFlag(questionId: string) {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      void persistProgress(answers, currentIdx, next, elapsedSec, false)
      return next
    })
  }

  function goToQuestion(idx: number) {
    setCurrentIdx(idx)
    void persistProgress(answers, idx, flagged, elapsedSec, false)
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

  const totalTimeAllowed = mockData?.data?.timeLimit ?? 7200
  const pausedRemainingSec = Math.max(0, totalTimeAllowed - pausedElapsedSec)

  // Start / Resume screen
  if (!started) {
    return (
      <div
        style={{
          maxWidth: 620,
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
            flexWrap: 'wrap',
            justifyContent: 'center',
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
              {hasPausedSession ? 'Time Remaining' : 'Time Allowed'}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              {hasPausedSession
                ? formatCountdown(pausedRemainingSec)
                : mockData?.data?.timeLimit
                ? formatCountdown(mockData.data.timeLimit)
                : '—'}
            </p>
          </div>
          {hasPausedSession && (
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
                Saved Progress
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 500,
                  color: 'var(--color-accent)',
                }}
              >
                {pausedAnsweredCount}/{mockData?.data?.questionCount ?? '—'}
              </p>
            </div>
          )}
        </div>

        {hasPausedSession ? (
          <div className="w-full rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-left">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1.5">
              <PauseCircle size={16} variant="Bold" />
              Paused Session Available
            </div>
            <p className="text-sm text-[var(--color-ink)] font-medium mb-1">
              You have an in-progress mock exam with{' '}
              <strong>{pausedAnsweredCount} answered questions</strong> and{' '}
              <strong>{formatCountdown(pausedRemainingSec)}</strong> left on the clock.
            </p>
            <p className="text-xs text-[var(--color-ink-3)] m-0">
              Continue directly from Question {(savedLocal?.currentIdx ?? 0) + 1}, or start fresh if you want to reset your paper.
            </p>
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-3)' }}>
            Once you begin, the timer starts. You can pause the exam at any time and continue from where you stopped whenever you are ready.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {hasPausedSession ? (
            <>
              <Button
                variant="accent"
                size="lg"
                onClick={() => void handleStartOrResume(false)}
                className="gap-2"
              >
                <Play size={18} variant="Bold" />
                Continue From Where You Stopped
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => void handleStartOrResume(true)}
                className="gap-2"
              >
                <RotateCcw size={16} />
                Start Over Fresh
              </Button>
            </>
          ) : (
            <Button variant="accent" size="lg" onClick={() => void handleStartOrResume(false)}>
              Begin exam
            </Button>
          )}
        </div>
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
  const isCurrentFlagged = currentQuestion ? flagged.has(currentQuestion.id) : false

  if (!currentQuestion) return null

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          marginBottom: 20,
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
              margin: 0,
            }}
          >
            Question {currentIdx + 1} of {questions.length}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--color-ink-3)',
              }}
            >
              {answeredCount} of {questions.length} answered
            </span>
            {lastSavedNotice && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 size={12} />
                {lastSavedNotice}
              </span>
            )}
          </div>
        </div>

        {/* Countdown */}
        <div
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border"
          style={{
            borderColor:
              timeLeft !== null && timeLeft < 300 ? 'var(--color-danger)' : 'var(--color-rule-2)',
            backgroundColor: isPaused ? 'rgba(245, 158, 11, 0.12)' : 'var(--color-card)',
          }}
        >
          <Timer1
            size={18}
            color={
              isPaused
                ? '#d97706'
                : timeLeft !== null && timeLeft < 300
                ? 'var(--color-danger)'
                : 'var(--color-accent)'
            }
            variant="Bold"
          />
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 600,
              color: isPaused
                ? '#d97706'
                : timeLeft !== null && timeLeft < 300
                  ? 'var(--color-danger)'
                  : 'var(--color-ink)',
              fontVariantNumeric: 'tabular-nums',
              margin: 0,
            }}
          >
            {timeLeft !== null ? formatCountdown(timeLeft) : '—'}
          </p>
          {isPaused && (
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
              Paused
            </span>
          )}
        </div>

        {/* Pause, Save & Exit, and Submit controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handlePauseExam()}
            disabled={isSubmitting || isSavingProgress}
            className="gap-1.5"
          >
            <PauseCircle size={15} color="currentColor" variant="Bold" />
            Pause
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleSaveAndExit()}
            disabled={isSubmitting || isSavingProgress}
            className="gap-1.5 text-[var(--color-ink-2)]"
            title="Save your progress and continue later"
          >
            <LogOut size={14} />
            Save & Exit
          </Button>
          <Button
            variant="accent"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            size="sm"
          >
            {isSubmitting ? 'Submitting...' : 'Submit exam'}
          </Button>
        </div>
      </div>

      {/* Question navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {questions.map((q, i) => {
          const isQFlagged = flagged.has(q.id)
          const isQAnswered = Boolean(answers[q.id])
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => goToQuestion(i)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                border:
                  i === currentIdx
                    ? '2px solid var(--color-accent)'
                    : isQFlagged
                      ? '1.5px solid #f59e0b'
                      : '1px solid var(--color-rule)',
                backgroundColor: isQFlagged
                  ? 'rgba(245, 158, 11, 0.18)'
                  : isQAnswered
                    ? 'var(--color-accent-tint)'
                    : i === currentIdx
                      ? 'var(--color-paper-3)'
                      : 'var(--color-paper)',
                color: isQFlagged
                  ? '#d97706'
                  : i === currentIdx
                    ? 'var(--color-accent)'
                    : 'var(--color-ink-2)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: isQAnswered || isQFlagged ? 700 : 400,
              }}
            >
              {i + 1}
            </button>
          )
        })}
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
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-ink-3)',
              textTransform: 'uppercase',
            }}
          >
            Question {currentIdx + 1}
          </span>
          <button
            type="button"
            onClick={() => toggleFlag(currentQuestion.id)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors cursor-pointer"
            style={{
              borderColor: isCurrentFlagged ? '#f59e0b' : 'var(--color-rule-2)',
              backgroundColor: isCurrentFlagged
                ? 'rgba(245, 158, 11, 0.15)'
                : 'var(--color-paper-2)',
              color: isCurrentFlagged ? '#d97706' : 'var(--color-ink-2)',
            }}
          >
            <Flag size={13} color="currentColor" variant={isCurrentFlagged ? 'Bold' : 'Linear'} />
            {isCurrentFlagged ? 'Flagged for Review' : 'Flag for Review'}
          </button>
        </div>

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

        {currentQuestion.imageUrl && (
          <div style={{ paddingLeft: 28 }}>
            <QuestionImage url={currentQuestion.imageUrl} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 28 }}>
          {currentQuestion.options.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.id
            return (
              <button
                key={opt.id}
                type="button"
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
          onClick={() => goToQuestion(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={() => goToQuestion(Math.min(questions.length - 1, currentIdx + 1))}
          disabled={currentIdx === questions.length - 1}
        >
          Next
        </Button>
      </div>

      {/* Pause Overlay Modal — freezes timer and hides paper until resumed */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <PauseCircle size={32} variant="Bold" />
            </div>
            <h2
              className="text-2xl font-bold text-[var(--color-ink)] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mock Exam Paused
            </h2>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-5">
              Your timer is paused at{' '}
              <strong className="font-mono text-[var(--color-ink)]">
                {timeLeft !== null ? formatCountdown(timeLeft) : '—'}
              </strong>{' '}
              and your progress (<strong>{answeredCount}</strong> of{' '}
              <strong>{questions.length}</strong> answered, Question{' '}
              <strong>{currentIdx + 1}</strong>) has been saved automatically.
            </p>

            <div className="flex flex-col gap-2.5">
              <Button
                variant="accent"
                size="lg"
                onClick={() => setIsPaused(false)}
                className="w-full gap-2 justify-center"
              >
                <Play size={18} variant="Bold" />
                Resume Exam Now
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => void handleSaveAndExit()}
                disabled={isSavingProgress}
                className="w-full gap-2 justify-center"
              >
                <LogOut size={16} />
                {isSavingProgress ? 'Saving...' : 'Save & Continue Later'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
