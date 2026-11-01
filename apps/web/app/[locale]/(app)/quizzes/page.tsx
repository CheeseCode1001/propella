'use client'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { format } from 'date-fns'
import { useSubjects } from '@/lib/hooks/use-subjects'
import { useRoadmap } from '@/lib/hooks/use-roadmap'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskSquare, Timer1, Book1 } from 'iconsax-reactjs'
import { EmptyState } from '@/components/common/empty-state'
import { useAuthStore } from '@/lib/stores/auth-store'
import { UploadCloud, FileText, X, Sparkles, CheckCircle2, Clock } from 'lucide-react'
import type { QuizMode, Subject } from '@propella/shared'

const QUIZ_MODE_OPTIONS: {
  value: QuizMode
  labelKey: 'studyMode' | 'examMode'
  descKey: 'studyModeDesc' | 'examModeDesc'
  badge: string
  highlights: string[]
}[] = [
  {
    value: 'study',
    labelKey: 'studyMode',
    descKey: 'studyModeDesc',
    badge: 'Untimed · Instant Feedback',
    highlights: [
      'No countdown timer — learn at your own pace',
      'Instant answer check & full explanation after each question',
      'Step-by-step walkthroughs to fix weak spots immediately',
    ],
  },
  {
    value: 'exam',
    labelKey: 'examMode',
    descKey: 'examModeDesc',
    badge: 'Timed CBT · Exam Simulation',
    highlights: [
      'Strict countdown timer (90s per question) with auto-submit',
      'No hints or explanations until final submission',
      'Skip, flag for review, and change answers freely before submitting',
    ],
  },
]

/** Topic-select value for a quiz drawn from the whole subject's past questions. */
const ALL_TOPICS = '__all__'

interface QuizListItem {
  quizId: string
  attemptId: string | null
  topicSlug: string
  subjectSlug: string
  difficulty?: string
  mode: QuizMode
  score: number | null
  questionCount: number
  createdAt: string
}

function getSubjectColor(slug: string): string {
  const map: Record<string, string> = {
    english: 'var(--color-subj-english, #3b82f6)',
    mathematics: 'var(--color-subj-math, #ef4444)',
    physics: 'var(--color-subj-physics, #8b5cf6)',
    chemistry: 'var(--color-subj-chemistry, #10b981)',
    biology: 'var(--color-subj-biology, #06b6d4)',
    economics: 'var(--color-subj-economics, #f59e0b)',
    government: 'var(--color-subj-government, #6366f1)',
    literature: 'var(--color-subj-literature, #ec4899)',
    crk: '#a855f7',
    irk: '#14b8a6',
    history: '#d97706',
    commerce: '#0ea5e9',
    accounting: '#84cc16',
    geography: '#22c55e',
    'agricultural-science': '#16a34a',
    'civic-education': '#6366f1',
    'further-mathematics': '#e11d48',
  }
  return map[slug] ?? 'var(--color-subj-default, var(--color-accent))'
}

function useRecentQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: () => api.get<{ data: QuizListItem[] }>('/quizzes').then((r) => r.data),
  })
}

export default function QuizzesPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('quiz')
  const searchParams = useSearchParams()
  const initialSubjectParam = searchParams.get('subject')
  const initialTopicParam = searchParams.get('topic')
  const initialModeParam = searchParams.get('mode')

  const { data: subjects, isLoading: subjectsLoading } = useSubjects()
  const { data: roadmap } = useRoadmap()
  const { data: recentQuizzes, isLoading: quizzesLoading } = useRecentQuizzes()

  // Filter subjects to only those the student selected in onboarding / roadmap
  const enrolledSubjectSlugs = useMemo(() => {
    if (!roadmap?.nodes || roadmap.nodes.length === 0) return null
    return new Set(roadmap.nodes.map((n) => n.subjectSlug))
  }, [roadmap])

  const availableSubjects = useMemo(() => {
    if (!subjects) return []
    if (!enrolledSubjectSlugs || enrolledSubjectSlugs.size === 0) return subjects
    return subjects.filter((s) => enrolledSubjectSlugs.has(s.slug))
  }, [subjects, enrolledSubjectSlugs])

  const user = useAuthStore((s) => s.user)
  const isUndergrad = Boolean(user?.undergraduateMode)

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [mode, setMode] = useState<QuizMode>(initialModeParam === 'exam' ? 'exam' : 'study')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // File/Note-based Quiz State
  const [attachedNote, setAttachedNote] = useState<{ name: string; content: string } | null>(null)

  function handleNoteFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const docName = file.name.replace(/\.[^/.]+$/, '')

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = (event.target?.result as string) || ''
      setAttachedNote({ name: docName, content })
      setError(null)
    }
    reader.readAsText(file)
  }

  // Filter topics for the chosen subject strictly to the student's enrolled syllabus topics
  const availableTopics = useMemo(() => {
    if (!selectedSubject) return []
    if (!roadmap?.nodes || roadmap.nodes.length === 0) {
      return (selectedSubject.topics ?? []).map((t) => ({ slug: t.slug, name: t.name }))
    }
    const topicMap = new Map<string, string>()
    for (const node of roadmap.nodes) {
      if (node.subjectSlug === selectedSubject.slug) {
        topicMap.set(node.topicSlug, node.topicName)
      }
    }
    if (topicMap.size === 0) {
      return (selectedSubject.topics ?? []).map((t) => ({ slug: t.slug, name: t.name }))
    }
    return Array.from(topicMap.entries()).map(([slug, name]) => ({ slug, name }))
  }, [selectedSubject, roadmap])

  // Pre-select subject/topic from URL query parameters if available
  useEffect(() => {
    if (availableSubjects.length > 0 && initialSubjectParam && !selectedSubject) {
      const match = availableSubjects.find((s) => s.slug === initialSubjectParam)
      if (match) {
        setSelectedSubject(match)
        if (initialTopicParam) {
          setSelectedTopic(initialTopicParam)
        }
      }
    }
  }, [availableSubjects, initialSubjectParam, initialTopicParam, selectedSubject])

  async function handleGenerate() {
    if (attachedNote) {
      setError(null)
      setGenerating(true)
      try {
        const result = await api.post<{ data: { id?: string; quizId?: string } }>('/quizzes/generate', {
          noteContent: attachedNote.content,
          documentName: attachedNote.name,
          mode,
          questionCount: 10,
          locale,
        })
        const qId = result.data.id || result.data.quizId
        router.push(`/quizzes/${qId}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate quiz from note')
        setGenerating(false)
      }
      return
    }

    if (!selectedSubject || !selectedTopic) {
      setError('Please select a subject and topic, or upload a note/document')
      return
    }

    setError(null)
    setGenerating(true)

    const wholeSubject = selectedTopic === ALL_TOPICS

    try {
      const result = await api.post<{ data: { quizId: string } }>('/quizzes/generate', {
        subjectSlug: selectedSubject.slug,
        ...(wholeSubject ? {} : { topicSlug: selectedTopic }),
        type: wholeSubject ? 'subject' : 'topic',
        difficulty: 'adaptive',
        mode,
        questionCount: 10,
        locale,
      })
      router.push(`/quizzes/${result.data.quizId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
      setGenerating(false)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 500,
            color: 'var(--color-ink)',
            marginBottom: 6,
          }}
        >
          {isUndergrad ? 'Course Quiz & Assessment Engine' : t('title')}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--color-ink-3)',
          }}
        >
          {isUndergrad
            ? 'Generate practice quizzes from your course lecture notes, textbooks, and past papers.'
            : 'Choose Study Mode for instant explanations or Exam Mode for timed CBT simulation.'}
        </p>
      </div>

      {/* Start a quiz section */}
      <Card style={{ marginBottom: 32 }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16 }}>
            {isUndergrad ? 'Generate Course Quiz' : 'Start a quiz'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Prominent Mode Picker at the Top */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-ink-2)',
                  marginBottom: 8,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                1. {t('selectMode')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUIZ_MODE_OPTIONS.map((m) => {
                  const active = mode === m.value
                  const isExam = m.value === 'exam'
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMode(m.value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 8,
                        textAlign: 'left',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: active
                          ? '2px solid var(--color-accent)'
                          : '1.5px solid var(--color-rule-2)',
                        backgroundColor: active
                          ? 'var(--color-accent-tint)'
                          : 'var(--color-paper-2)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2">
                          {isExam ? (
                            <Timer1
                              size={18}
                              color={active ? 'var(--color-accent)' : 'var(--color-ink-2)'}
                              variant={active ? 'Bold' : 'Linear'}
                            />
                          ) : (
                            <Book1
                              size={18}
                              color={active ? 'var(--color-accent)' : 'var(--color-ink-2)'}
                              variant={active ? 'Bold' : 'Linear'}
                            />
                          )}
                          <span
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: 14.5,
                              fontWeight: 700,
                              color: active ? 'var(--color-accent)' : 'var(--color-ink)',
                            }}
                          >
                            {t(m.labelKey)}
                          </span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: active ? 'var(--color-accent)' : 'var(--color-paper-3)',
                            color: active ? '#fff' : 'var(--color-ink-2)',
                          }}
                        >
                          {m.badge}
                        </span>
                      </div>

                      <ul className="flex flex-col gap-1 pl-0 m-0 list-none">
                        {m.highlights.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-1.5 text-[11.5px] leading-snug"
                            style={{ color: 'var(--color-ink-2)' }}
                          >
                            <CheckCircle2
                              size={13}
                              className="shrink-0 mt-0.5"
                              style={{ color: active ? 'var(--color-accent)' : 'var(--color-ink-3)' }}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Attached Note Display (When file is uploaded, Subject and Topic are hidden) */}
            {attachedNote ? (
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-tint)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={20} className="text-[var(--color-accent)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-ink)] truncate">
                      {attachedNote.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-ink-3)]">
                      Quiz questions will be synthesized directly from this material in{' '}
                      <strong>{mode === 'exam' ? 'Exam Mode' : 'Study Mode'}</strong>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedNote(null)}
                  className="p-1 rounded text-[var(--color-ink-3)] hover:text-red-600 transition-colors"
                  title="Remove document and return to syllabus topics"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* Only show Subject and Topic selectors when no note is uploaded and not restricted to undergraduate files */}
                {!isUndergrad && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Subject select */}
                    <div>
                      <label
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--color-ink-2)',
                          marginBottom: 6,
                          display: 'block',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        2. Subject
                      </label>
                      {subjectsLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <select
                          value={selectedSubject?.slug ?? ''}
                          onChange={(e) => {
                            const subj = availableSubjects.find((s) => s.slug === e.target.value) ?? null
                            setSelectedSubject(subj)
                            setSelectedTopic('')
                          }}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-rule-2)',
                            backgroundColor: 'var(--color-paper-2)',
                            color: 'var(--color-ink)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 14,
                            outline: 'none',
                            appearance: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">Select a subject...</option>
                          {availableSubjects.map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Topic select */}
                    <div>
                      <label
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--color-ink-2)',
                          marginBottom: 6,
                          display: 'block',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        3. Topic
                      </label>
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        disabled={!selectedSubject}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-rule-2)',
                          backgroundColor: selectedSubject ? 'var(--color-paper-2)' : 'var(--color-paper-3)',
                          color: 'var(--color-ink)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: 14,
                          outline: 'none',
                          appearance: 'none',
                          cursor: selectedSubject ? 'pointer' : 'not-allowed',
                          opacity: selectedSubject ? 1 : 0.5,
                        }}
                      >
                        <option value="">Select a topic...</option>
                        <option value={ALL_TOPICS}>All topics (past questions)</option>
                        {availableTopics.map((t) => (
                          <option key={t.slug} value={t.slug}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* File Upload Trigger */}
                <div className="p-3 rounded-lg border border-dashed border-[var(--color-rule-2)] bg-[var(--color-paper-2)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <UploadCloud size={20} className="text-[var(--color-accent)]" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-ink)]">
                        Or generate quiz from a document / note
                      </p>
                      <p className="text-[11px] text-[var(--color-ink-3)]">
                        Upload PDF, DOCX, TXT or study notes
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      onChange={handleNoteFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--color-paper-3)] text-[var(--color-ink)] hover:bg-[var(--color-accent)] hover:text-white transition-colors">
                      <Sparkles size={13} />
                      <span>Upload Note</span>
                    </span>
                  </label>
                </div>
              </>
            )}

            {error && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--color-danger)',
                }}
              >
                {error}
              </p>
            )}

            <Button
              variant="accent"
              onClick={handleGenerate}
              disabled={generating || (!attachedNote && (!selectedSubject || !selectedTopic))}
              className="gap-2"
            >
              {mode === 'exam' ? <Clock size={16} /> : <Sparkles size={16} />}
              {generating
                ? 'Generating...'
                : mode === 'exam'
                ? 'Start Timed Exam Mode Quiz (15m)'
                : 'Start Study Mode Quiz (Instant Feedback)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent quizzes */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--color-ink)',
            marginBottom: 12,
          }}
        >
          Recent quizzes
        </h2>

        {quizzesLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !recentQuizzes || recentQuizzes.length === 0 ? (
          <EmptyState
            icon={TaskSquare}
            title="No quizzes yet"
            message="Pick a topic above to generate your first one. Every question you try makes the next one easier."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {recentQuizzes.map((quiz) => {
              const subjColor = getSubjectColor(quiz.subjectSlug)
              const title = quiz.topicSlug
                ? quiz.topicSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                : `${quiz.subjectSlug.replace(/-/g, ' ').toUpperCase()} · All Topics`
              const correctEstimated =
                quiz.score !== null ? Math.round((quiz.score / 100) * quiz.questionCount) : null

              return (
                <div
                  key={quiz.quizId}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-card)] hover:border-[var(--color-accent)]/50 hover:shadow-md transition-all duration-200"
                  style={{ borderLeft: `4px solid ${subjColor}` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: subjColor }}
                      >
                        {quiz.subjectSlug.replace(/-/g, ' ')}
                      </span>
                      <span
                        className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1"
                        style={{
                          backgroundColor:
                            quiz.mode === 'exam' ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-accent-tint)',
                          color: quiz.mode === 'exam' ? '#d97706' : 'var(--color-accent)',
                        }}
                      >
                        {quiz.mode === 'exam' ? '⏱ Exam Mode' : '📖 Study Mode'}
                      </span>
                      {quiz.difficulty && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-paper-3)] text-[var(--color-ink-3)] font-mono capitalize">
                          {quiz.difficulty}
                        </span>
                      )}
                    </div>

                    <h4 className="text-[15px] font-semibold text-[var(--color-ink)] truncate mb-1">
                      {title}
                    </h4>

                    <div className="flex items-center gap-2.5 text-xs text-[var(--color-ink-3)] flex-wrap">
                      <span>{format(new Date(quiz.createdAt), 'MMM d, yyyy · HH:mm')}</span>
                      <span>•</span>
                      <span>{quiz.questionCount} Questions</span>
                      {correctEstimated !== null && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-[var(--color-ink-2)]">
                            {correctEstimated}/{quiz.questionCount} Correct
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--color-rule-2)]">
                    {quiz.score !== null ? (
                      <div className="text-right">
                        <Badge
                          variant={
                            quiz.score >= 70
                              ? 'success'
                              : quiz.score >= 50
                              ? 'accent'
                              : 'danger'
                          }
                          className="text-xs px-2.5 py-1"
                        >
                          {quiz.score}%
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="default" className="text-xs">
                        Not Completed
                      </Badge>
                    )}

                    <div className="flex items-center gap-1.5">
                      {quiz.attemptId && quiz.score !== null ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/quizzes/${quiz.quizId}/results/${quiz.attemptId}`)}
                          className="h-8 px-3 text-xs font-semibold"
                        >
                          Review Results
                        </Button>
                      ) : (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => router.push(`/quizzes/${quiz.quizId}`)}
                          className="h-8 px-3 text-xs font-semibold"
                        >
                          Continue
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/quizzes/${quiz.quizId}`)}
                        title="Retake Quiz"
                        className="h-8 px-2.5 text-xs text-[var(--color-ink-3)] hover:text-[var(--color-accent)]"
                      >
                        Retake
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
