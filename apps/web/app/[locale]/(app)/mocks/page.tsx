'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentText } from 'iconsax-reactjs'
import { EmptyState } from '@/components/common/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'

interface MockHistoryItem {
  mockId: string
  attemptId: string | null
  score: number | null
  questionCount: number
  timeLimit: number
  createdAt: string
  completedAt: string | null
}

interface ExamProfileData {
  examType: 'jamb' | 'waec' | 'neco'
  subjects: Array<{ slug: string; name: string }>
}

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

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function MocksPage() {
  const router = useRouter()
  const t = useTranslations('mocks')
  const [showModal, setShowModal] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'english',
    'mathematics',
  ])
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: examProfile } = useQuery({
    queryKey: ['exam-profile'],
    queryFn: () =>
      api
        .get<{ data: ExamProfileData }>('/onboarding/profile')
        .then((r) => r.data)
        .catch(() => null),
  })

  const examType = examProfile?.examType ?? 'jamb'

  const { data: history, isLoading } = useQuery({
    queryKey: ['mock-history'],
    queryFn: () =>
      api
        .get<{ data: { mocks: MockHistoryItem[] } }>('/mocks')
        .then((r) => r.data.mocks),
  })

  function toggleSubject(slug: string) {
    setSelectedSubjects((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  async function handleGenerate() {
    if (selectedSubjects.length === 0) return
    setIsGenerating(true)
    try {
      const result = await api.post<{ data: { mockId: string } }>('/mocks/generate', {
        examType,
        subjectSlugs: selectedSubjects,
      })
      setShowModal(false)
      router.push(`/mocks/${result.data.mockId}`)
    } catch {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{ margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 500,
              color: 'var(--color-ink)',
              marginBottom: 8,
            }}
          >
            {t('title')}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-ink-2)' }}>
            Full-length practice papers from the real syllabus.
          </p>
        </div>
        <Button variant="accent" onClick={() => setShowModal(true)}>
          {t('startMock')}
        </Button>
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <Card style={{ width: '100%', maxWidth: 480 }}>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Configure mock exam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ marginBottom: 20 }}>
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
                  {t('examType')}
                </p>
                <Badge variant="default" style={{ textTransform: 'uppercase', fontSize: 13 }}>
                  {examType}
                </Badge>
              </div>

              <div style={{ marginBottom: 24 }}>
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
                  Subjects
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SUBJECT_SLUGS.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => toggleSubject(s.slug)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: selectedSubjects.includes(s.slug)
                          ? '2px solid var(--color-accent)'
                          : '2px solid var(--color-rule)',
                        backgroundColor: selectedSubjects.includes(s.slug)
                          ? 'var(--color-accent-tint)'
                          : 'transparent',
                        color: selectedSubjects.includes(s.slug)
                          ? 'var(--color-accent)'
                          : 'var(--color-ink-2)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  variant="accent"
                  onClick={handleGenerate}
                  disabled={isGenerating || selectedSubjects.length === 0}
                >
                  {isGenerating ? 'Generating...' : 'Generate mock'}
                </Button>
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
              {isGenerating && (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    color: 'var(--color-ink-3)',
                    marginTop: 12,
                  }}
                >
                  Generating your exam paper. This may take up to a minute.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* History */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !history || history.length === 0 ? (
        <EmptyState
          icon={DocumentText}
          title="No mock exams yet"
          message="A full paper shows you what daily practice cannot. Try one once you have covered a good part of your syllabus."
          action={
            <Button variant="accent" onClick={() => setShowModal(true)}>
              Start your first mock
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map((mock) => (
            <div
              key={mock.mockId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-rule)',
                backgroundColor: 'var(--color-card)',
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'var(--color-ink)',
                    marginBottom: 4,
                  }}
                >
                  {t('questions', { count: mock.questionCount })} · {formatDuration(mock.timeLimit)} allowed
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-ink-3)',
                  }}
                >
                  {new Date(mock.createdAt).toLocaleDateString()}
                  {mock.completedAt ? ` · Completed ${new Date(mock.completedAt).toLocaleDateString()}` : ''}
                </p>
              </div>
              {mock.score !== null ? (
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 500,
                    color:
                      mock.score >= 60
                        ? 'var(--color-success)'
                        : mock.score >= 40
                          ? 'var(--color-warning)'
                          : 'var(--color-danger)',
                  }}
                >
                  {mock.score}%
                </span>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/mocks/${mock.mockId}`)}
                >
                  Continue
                </Button>
              )}
              {mock.score !== null && mock.attemptId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/mocks/${mock.mockId}/results/${mock.attemptId}`)}
                >
                  Review
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
