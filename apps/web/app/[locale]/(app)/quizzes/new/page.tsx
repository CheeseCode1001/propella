'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api-client'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { TaskSquare, Refresh } from 'iconsax-reactjs'

export default function NewQuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subjectSlug = searchParams.get('subject')
  const topicSlug = searchParams.get('topic')
  const mode = (searchParams.get('mode') as 'study' | 'exam') || 'study'

  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  async function generateAndRedirect() {
    if (!subjectSlug) {
      router.replace('/quizzes')
      return
    }

    setError(null)
    setRetrying(true)

    try {
      const isWholeSubject = !topicSlug || topicSlug === '__all__'
      const res = await api.post<{ data: { quizId: string } }>('/quizzes/generate', {
        subjectSlug,
        ...(isWholeSubject ? {} : { topicSlug }),
        type: isWholeSubject ? 'subject' : 'topic',
        difficulty: 'adaptive',
        mode,
        questionCount: 10,
      })

      router.replace(`/quizzes/${res.data.quizId}`)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Could not generate quiz. You can pick options manually on the Quizzes page.'
      )
      setRetrying(false)
    }
  }

  useEffect(() => {
    generateAndRedirect()
  }, [subjectSlug, topicSlug, mode])

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-danger-tint)] text-[var(--color-danger)]">
          <TaskSquare size={24} variant="Bold" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-ink)]">
          Quiz Generation
        </h2>
        <p className="mb-6 text-sm text-[var(--color-ink-2)]">{error}</p>
        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push(subjectSlug ? `/quizzes?subject=${subjectSlug}` : '/quizzes')}
          >
            Go to Quizzes
          </Button>
          <Button
            variant="accent"
            disabled={retrying}
            onClick={() => generateAndRedirect()}
          >
            <Refresh size={16} className={retrying ? 'animate-spin' : ''} />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mb-4 inline-flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[var(--color-accent-tint)] text-[var(--color-accent)]">
        <TaskSquare size={28} variant="Bulk" />
      </div>
      <h2
        className="mb-2 text-xl font-medium text-[var(--color-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Preparing your practice quiz
      </h2>
      <p className="mb-6 text-sm text-[var(--color-ink-3)]">
        Gathering questions adapted to your syllabus and level...
      </p>
      <div className="mx-auto w-48 space-y-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-2 w-3/4 mx-auto rounded-full" />
      </div>
    </div>
  )
}
