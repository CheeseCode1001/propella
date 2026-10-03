'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { useSubjects } from '@/lib/hooks/use-subjects'
import { useRoadmap } from '@/lib/hooks/use-roadmap'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskSquare } from 'iconsax-reactjs'
import { EmptyState } from '@/components/common/empty-state'
import { cn } from '@/lib/utils/cn'
import type { QuizMode, Subject } from '@propella/shared'

const QUIZ_MODE_OPTIONS: {
  value: QuizMode
  labelKey: 'studyMode' | 'examMode'
  descKey: 'studyModeDesc' | 'examModeDesc'
}[] = [
  { value: 'study', labelKey: 'studyMode', descKey: 'studyModeDesc' },
  { value: 'exam', labelKey: 'examMode', descKey: 'examModeDesc' },
]

/** Topic-select value for a quiz drawn from the whole subject's past questions. */
const ALL_TOPICS = '__all__'

interface QuizListItem {
  quizId: string
  attemptId: string | null
  topicSlug: string
  subjectSlug: string
  mode: QuizMode
  score: number | null
  questionCount: number
  createdAt: string
}

function useRecentQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: () => api.get<{ data: QuizListItem[] }>('/quizzes').then((r) => r.data),
  })
}

export default function QuizzesPage() {
  const router = useRouter()
  const t = useTranslations('quiz')
  const searchParams = useSearchParams()
  const initialSubjectParam = searchParams.get('subject')
  const initialTopicParam = searchParams.get('topic')

  const { data: subjects, isLoading: subjectsLoading } = useSubjects()
  const { data: roadmap, isLoading: roadmapLoading } = useRoadmap()
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

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [mode, setMode] = useState<QuizMode>('study')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (!selectedSubject || !selectedTopic) {
      setError('Please select a subject and topic')
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
        // Difficulty is no longer a user-facing choice - the engine adapts it.
        difficulty: 'adaptive',
        mode,
        questionCount: 10,
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
          {t('title')}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--color-ink-3)',
          }}
        >
          Practice your topics, one question at a time.
        </p>
      </div>

      {/* Start a quiz section */}
      <Card style={{ marginBottom: 32 }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16 }}>
            Start a quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Subject select */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-ink-2)',
                  marginBottom: 6,
                  display: 'block',
                }}
              >
                Subject
              </label>
              {subjectsLoading ? (
                <Skeleton className="h-9 w-full" />
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
                    padding: '8px 12px',
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
                  fontWeight: 500,
                  color: 'var(--color-ink-2)',
                  marginBottom: 6,
                  display: 'block',
                }}
              >
                Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedSubject}
                style={{
                  width: '100%',
                  padding: '8px 12px',
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

            {/* Mode picker */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-ink-2)',
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                {t('selectMode')}
              </label>
              <div style={{ display: 'grid', gap: 8 }}>
                {QUIZ_MODE_OPTIONS.map((m) => {
                  const active = mode === m.value
                  return (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: active
                          ? '1.5px solid var(--color-accent)'
                          : '1.5px solid var(--color-rule-2)',
                        backgroundColor: active
                          ? 'var(--color-accent-tint)'
                          : 'var(--color-paper-2)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: active ? 'var(--color-accent)' : 'var(--color-ink)',
                        }}
                      >
                        {t(m.labelKey)}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                          color: 'var(--color-ink-3)',
                          lineHeight: 1.5,
                        }}
                      >
                        {t(m.descKey)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

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
              disabled={generating || !selectedSubject || !selectedTopic}
            >
              {generating ? 'Generating...' : t('generateQuiz')}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-rule)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--color-ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {quiz.topicSlug
                      ? quiz.topicSlug.replace(/-/g, ' ')
                      : `${quiz.subjectSlug.replace(/-/g, ' ')} - all topics`}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      color: 'var(--color-ink-3)',
                    }}
                  >
                    {format(new Date(quiz.createdAt), 'MMM d, yyyy')}
                    {' · '}
                    {quiz.questionCount} questions
                    {' · '}
                    {quiz.mode === 'exam' ? t('examMode') : t('studyMode')}
                  </p>
                </div>

                {quiz.score !== null ? (
                  <Badge
                    variant={
                      quiz.score >= 70
                        ? 'success'
                        : quiz.score >= 50
                        ? 'accent'
                        : 'danger'
                    }
                  >
                    {quiz.score}%
                  </Badge>
                ) : (
                  <Badge variant="default">Not attempted</Badge>
                )}

                {quiz.attemptId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/quizzes/${quiz.quizId}/results/${quiz.attemptId}`,
                      )
                    }
                  >
                    View
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
