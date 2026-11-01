'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { QuestionImage } from '@/components/common/question-image'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/common/loading-state'
import { Timer1, Book1, Flag } from 'iconsax-reactjs'
import { AlertTriangle, CheckCircle2, XCircle, Send } from 'lucide-react'

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
  /** Present on questions from the past-question bank. */
  source?: string
  /** Diagram the question depends on (past-question bank). */
  imageUrl?: string
}

interface QuizData {
  id: string
  type: string
  difficulty: string
  mode: 'study' | 'exam'
  timeLimit?: number | null
  topicRef?: { subjectSlug: string; topicSlug: string }
  questions: QuizQuestion[]
}

type AnswerMap = Map<string, 'A' | 'B' | 'C' | 'D'>

function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds)
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function QuizEnginePage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('quiz')
  const tCommon = useTranslations('common')
  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>(new Map())
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false)
  // Study mode marks a question as revealed the moment it is answered.
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  // Exam mode countdown timer (seconds remaining)
  const [remainingSec, setRemainingSec] = useState<number | null>(null)
  const autoSubmittedRef = useRef(false)

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
        const attemptRes = await api.post<{ data: { attemptId: string; quizId: string } }>(
          `/quizzes/${quizId}/attempt`,
        )
        if (cancelled) return

        setAttemptId(attemptRes.data.attemptId)

        const attemptData = await api.get<{
          data: { quiz: QuizData; attempt: { id: string } }
        }>(`/quizzes/attempts/${attemptRes.data.attemptId}`)
        if (cancelled) return

        const loadedQuiz = attemptData.data.quiz
        setQuiz(loadedQuiz)
        if (loadedQuiz.mode === 'exam') {
          const totalSec =
            loadedQuiz.timeLimit && loadedQuiz.timeLimit > 0
              ? loadedQuiz.timeLimit
              : loadedQuiz.questions.length * 90
          setRemainingSec(totalSec)
        }
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
  const isExamMode = quiz?.mode === 'exam'

  function recordQuestionTime(questionId: string) {
    const now = Date.now()
    const prev = questionTimesRef.current.get(questionId) ?? 0
    const elapsed = Math.round((now - questionStartRef.current) / 1000)
    questionTimesRef.current.set(questionId, prev + elapsed)
    questionStartRef.current = now
  }

  const submitQuizNow = useCallback(async () => {
    if (!quiz || !attemptId || submitting) return

    const currentQuestion = quiz.questions[currentIndex]
    if (currentQuestion) {
      recordQuestionTime(currentQuestion.id)
    }

    setSubmitting(true)
    setConfirmSubmitModal(false)

    const durationSec = Math.round((Date.now() - sessionStartRef.current) / 1000)

    // Only include questions the student actually answered so skipped questions
    // in Exam Mode are never accidentally credited with a default option.
    const answersPayload = quiz.questions
      .filter((q) => answers.has(q.id))
      .map((q) => ({
        questionId: q.id,
        selectedOptionId: answers.get(q.id)!,
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
  }, [quiz, attemptId, submitting, currentIndex, answers, quizId, router])

  // Countdown tick for Exam Mode
  useEffect(() => {
    if (!isExamMode || remainingSec === null || submitting) return

    if (remainingSec <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true
        void submitQuizNow()
      }
      return
    }

    const timer = setInterval(() => {
      setRemainingSec((prev) => (prev !== null ? Math.max(0, prev - 1) : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [isExamMode, remainingSec, submitting, submitQuizNow])

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

  function toggleFlag(questionId: string) {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
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

  function handleRequestSubmit() {
    if (!quiz) return
    if (isExamMode && answers.size < quiz.questions.length) {
      setConfirmSubmitModal(true)
      return
    }
    void submitQuizNow()
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
  const isFlagged = flagged.has(currentQuestion.id)

  // Live Study Mode stats
  let studyCorrectSoFar = 0
  let studyWrongSoFar = 0
  if (isStudyMode) {
    for (const q of quiz.questions) {
      if (revealed.has(q.id)) {
        if (answers.get(q.id) === q.correctOptionId) studyCorrectSoFar += 1
        else studyWrongSoFar += 1
      }
    }
  }

  const isLowTime = isExamMode && remainingSec !== null && remainingSec <= 120
  const isCriticalTime = isExamMode && remainingSec !== null && remainingSec <= 45

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '0 0 48px',
      }}
    >
      {/* Mode Top Bar — Clearly distinguishes Study Mode vs Exam Mode */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl mb-5 border"
        style={{
          backgroundColor: isExamMode ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-accent-tint)',
          borderColor: isExamMode ? 'rgba(245, 158, 11, 0.35)' : 'var(--color-accent)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isExamMode ? '#d97706' : 'var(--color-accent)',
              color: '#fff',
            }}
          >
            {isExamMode ? (
              <Timer1 size={18} color="currentColor" variant="Bold" />
            ) : (
              <Book1 size={18} color="currentColor" variant="Bold" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-extrabold uppercase tracking-wider"
                style={{ color: isExamMode ? '#d97706' : 'var(--color-accent)' }}
              >
                {isExamMode ? 'Exam Mode · Timed CBT' : 'Study Mode · Interactive Learning'}
              </span>
            </div>
            <p className="text-[11.5px] text-[var(--color-ink-2)] m-0">
              {isExamMode
                ? 'Answers & explanations are hidden until you submit. You can change answers freely.'
                : 'Instant answer verification & step-by-step explanation after every question.'}
            </p>
          </div>
        </div>

        {/* Right side of Mode Bar: Countdown Timer in Exam Mode OR Live Accuracy in Study Mode */}
        {isExamMode ? (
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold border"
              style={{
                backgroundColor: isCriticalTime
                  ? 'var(--color-danger)'
                  : isLowTime
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'var(--color-card)',
                borderColor: isLowTime ? 'var(--color-danger)' : 'var(--color-rule-2)',
                color: isCriticalTime
                  ? '#ffffff'
                  : isLowTime
                  ? 'var(--color-danger)'
                  : 'var(--color-ink)',
              }}
            >
              <Timer1 size={15} color="currentColor" variant="Bold" />
              <span>{remainingSec !== null ? formatClock(remainingSec) : '--:--'}</span>
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={handleRequestSubmit}
              disabled={submitting}
              className="h-8 px-3 text-xs font-semibold gap-1.5"
            >
              <Send size={13} />
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 size={13} />
              {studyCorrectSoFar} Correct
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-semibold">
              <XCircle size={13} />
              {studyWrongSoFar} Wrong
            </span>
          </div>
        )}
      </div>

      {/* Progress header */}
      <div style={{ marginBottom: 20 }}>
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
          <div className="flex items-center gap-3">
            {isExamMode && (
              <button
                type="button"
                onClick={() => toggleFlag(currentQuestion.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors cursor-pointer"
                style={{
                  borderColor: isFlagged ? '#f59e0b' : 'var(--color-rule-2)',
                  backgroundColor: isFlagged ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-paper-2)',
                  color: isFlagged ? '#d97706' : 'var(--color-ink-2)',
                }}
              >
                <Flag size={13} color="currentColor" variant={isFlagged ? 'Bold' : 'Linear'} />
                {isFlagged ? 'Flagged for Review' : 'Flag Question'}
              </button>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--color-ink-3)',
              }}
            >
              {t('answered', { count: answeredCount })} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            backgroundColor: 'var(--color-paper-3)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              backgroundColor: isExamMode ? '#d97706' : 'var(--color-accent)',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Which paper a real past question came from, e.g. "JAMB UTME 2014" */}
      {currentQuestion.source && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--color-ink-3)',
            marginBottom: 8,
          }}
        >
          {t('pastQuestion', { source: currentQuestion.source.replace(/\s+Q\d+$/, '') })}
        </p>
      )}

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

      {currentQuestion.imageUrl && <QuestionImage url={currentQuestion.imageUrl} />}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOption === option.id
          const isCorrectOption = option.id === currentQuestion.correctOptionId

          // Exam mode never colours options green/red — feedback waits for submission.
          let accent = isExamMode ? '#d97706' : 'var(--color-accent)'
          let tint = isExamMode ? 'rgba(245, 158, 11, 0.12)' : 'var(--color-accent-tint)'
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
              type="button"
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
                  color: 'var(--color-ink)',
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {option.text}
              </span>
              {isExamMode && isSelected && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Selected
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Study-mode instant explanation */}
      {isRevealed && (
        <div
          style={{
            marginTop: -8,
            marginBottom: 28,
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            border: `1.5px solid ${
              answeredCorrectly ? 'var(--color-success)' : 'var(--color-danger)'
            }`,
            backgroundColor: answeredCorrectly
              ? 'var(--color-success-tint)'
              : 'var(--color-danger-tint)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 700,
                color: answeredCorrectly ? 'var(--color-success)' : 'var(--color-danger)',
                margin: 0,
              }}
            >
              {answeredCorrectly ? `✓ ${t('correct')}` : `✗ ${t('incorrect')}`}
              {!answeredCorrectly && (
                <span style={{ fontWeight: 500, color: 'var(--color-ink-2)' }}>
                  {' \u00b7 '}
                  {t('correctAnswer')}: Option {currentQuestion.correctOptionId}
                </span>
              )}
            </p>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-3)]">
              Study Mode Explanation
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              lineHeight: 1.65,
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Exam-mode status hint when an option is selected */}
      {isExamMode && selectedOption && (
        <div className="mb-6 px-3.5 py-2.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] flex items-center justify-between text-xs text-[var(--color-ink-3)]">
          <span>
            Option <strong className="text-[var(--color-ink)]">{selectedOption}</strong> recorded.
            You can change your selection anytime before submitting.
          </span>
          <button
            type="button"
            onClick={() => {
              setAnswers((prev) => {
                const next = new Map(prev)
                next.delete(currentQuestion.id)
                return next
              })
            }}
            className="text-xs underline hover:text-[var(--color-danger)] cursor-pointer bg-transparent border-none"
          >
            Clear choice
          </button>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          {tCommon('previous')}
        </Button>

        <div className="flex items-center gap-2.5">
          {!isLastQuestion && (
            <Button variant="default" onClick={handleNext}>
              {isExamMode && !selectedOption ? 'Skip / Next' : tCommon('next')}
            </Button>
          )}
          {(isLastQuestion || isExamMode) && (
            <Button
              variant="accent"
              onClick={handleRequestSubmit}
              disabled={submitting || (!isExamMode && answeredCount === 0)}
            >
              {submitting
                ? `${tCommon('loading')}…`
                : isExamMode
                ? `Submit Exam (${answeredCount}/${totalQuestions})`
                : t('submitQuiz')}
            </Button>
          )}
        </div>
      </div>

      {/* Question number palette */}
      <div className="mt-7 pt-5 border-t border-[var(--color-rule)]">
        <div className="flex items-center justify-between mb-3 text-[11px] text-[var(--color-ink-3)]">
          <span className="font-semibold uppercase tracking-wider">Question Navigator</span>
          <div className="flex items-center gap-3">
            {isStudyMode ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Correct
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Wrong
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] inline-block" /> Answered
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Flagged
                </span>
              </>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-[var(--color-rule)] bg-[var(--color-paper-2)] inline-block" /> Unanswered
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {quiz.questions.map((q, idx) => {
            const isAnswered = answers.has(q.id)
            const isCurrent = idx === currentIndex
            const qFlagged = flagged.has(q.id)
            const qRevealed = isStudyMode && revealed.has(q.id)
            const qCorrect = qRevealed && answers.get(q.id) === q.correctOptionId

            let bg = 'var(--color-paper-2)'
            let textColor = 'var(--color-ink-3)'
            let border = isCurrent ? '2px solid var(--color-accent)' : '1.5px solid var(--color-rule)'

            if (qRevealed) {
              bg = qCorrect ? 'var(--color-success, #22c55e)' : 'var(--color-danger, #ef4444)'
              textColor = '#ffffff'
              border = isCurrent ? '2px solid var(--color-ink)' : 'none'
            } else if (qFlagged) {
              bg = '#f59e0b'
              textColor = '#ffffff'
              border = isCurrent ? '2px solid var(--color-ink)' : 'none'
            } else if (isAnswered) {
              bg = 'var(--color-accent)'
              textColor = '#ffffff'
            } else if (isCurrent) {
              bg = 'var(--color-accent-tint)'
              textColor = 'var(--color-accent)'
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  const curr = quiz.questions[currentIndex]
                  if (curr) recordQuestionTime(curr.id)
                  setCurrentIndex(idx)
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border,
                  backgroundColor: bg,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: textColor,
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

      {/* Unanswered confirmation modal in Exam Mode */}
      {confirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-rule)] bg-[var(--color-card)] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-amber-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-[var(--color-ink)] m-0">
                Submit Exam Early?
              </h3>
            </div>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-4">
              You have answered <strong>{answeredCount}</strong> of{' '}
              <strong>{totalQuestions}</strong> questions (
              <strong>{totalQuestions - answeredCount} unanswered</strong>
              {flagged.size > 0 ? `, ${flagged.size} flagged for review` : ''}). Unanswered
              questions will be marked incorrect.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <Button variant="secondary" onClick={() => setConfirmSubmitModal(false)}>
                Keep Working
              </Button>
              <Button variant="accent" onClick={() => void submitQuizNow()} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Exam Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
