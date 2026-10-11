'use client'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n/navigation'
import { api } from '@/lib/api-client'

export default function StudyNewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const started = useRef(false)

  const subjectSlug = searchParams.get('subject') ?? ''
  const topicSlug = searchParams.get('topic') ?? ''

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (!subjectSlug || !topicSlug) {
      router.replace('/dashboard')
      return
    }

    api
      .post<{ data: { sessionId: string } }>('/sessions/start', {
        subjectSlug,
        topicSlug,
        isMarathon: false,
      })
      .then(({ data }) => {
        router.replace(`/study/${data.sessionId}`)
      })
      .catch(() => {
        router.replace('/dashboard')
      })
  }, [subjectSlug, topicSlug, router])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid var(--color-accent)',
          borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-ink-3)',
        }}
      >
        Starting your session...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
