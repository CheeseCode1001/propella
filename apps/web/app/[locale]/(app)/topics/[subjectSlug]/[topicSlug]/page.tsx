'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Book1, Lamp, TaskSquare, Crown1 } from 'iconsax-reactjs'
import { Link } from '@/lib/i18n/navigation'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, errorKindFrom } from '@/components/common/error-state'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'
import { TopicActions } from '@/components/topics/topic-actions'
import { usePaywallStore } from '@/lib/stores/paywall-store'

interface TopicSection {
  heading: string
  points: string[]
}

interface TopicExample {
  title: string
  problem: string
  walkthrough: string[]
  answer: string
}

interface TopicNeighbour {
  subjectSlug: string
  topicSlug: string
  topicName: string
}

interface TopicReader {
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
  intro: string
  sections: TopicSection[]
  examples: TopicExample[]
  summary: string[]
  previous: TopicNeighbour | null
  next: TopicNeighbour | null
}

function ReaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[720px]">
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-4 h-9 w-2/3" />
      <Skeleton className="mb-8 h-16 w-full" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-8">
          <Skeleton className="mb-3 h-5 w-48" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TopicReaderPage() {
  const params = useParams()
  const subjectSlug = params.subjectSlug as string
  const topicSlug = params.topicSlug as string
  const online = useOnlineStatus()
  const router = useRouter()
  const [practicing, setPracticing] = useState(false)
  const openPaywall = usePaywallStore((s) => s.openPaywall)

  async function handleStartPractice() {
    if (!data) return
    setPracticing(true)
    try {
      const res = await api.post<{ data: { quizId: string } }>('/quizzes/generate', {
        subjectSlug: data.subjectSlug,
        topicSlug: data.topicSlug,
        type: 'topic',
        difficulty: 'adaptive',
        mode: 'study',
        questionCount: 10,
      })
      router.push('/quizzes/' + res.data.quizId)
    } catch {
      router.push('/quizzes/new?subject=' + data.subjectSlug + '&topic=' + data.topicSlug)
    } finally {
      setPracticing(false)
    }
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['topic-reader', subjectSlug, topicSlug],
    queryFn: () =>
      api
        .get<{ data: TopicReader }>(`/topics/${subjectSlug}/${topicSlug}`)
        .then((r) => r.data),
    // Notes are cached server-side and never change for a topic, so there is no
    // reason to refetch them during a reading session.
    staleTime: 60 * 60 * 1000,
  })

  if (isLoading) return <ReaderSkeleton />

  const isPaywallError = Boolean(
    error?.message &&
      (error.message.toLowerCase().includes('trial') ||
        error.message.toLowerCase().includes('paywall') ||
        error.message.toLowerCase().includes('scholar')),
  )

  if (isError || !data) {
    if (isPaywallError) {
      return (
        <div className="mx-auto w-full max-w-[640px] mt-12 p-8 rounded-3xl bg-[var(--color-paper-2)] border border-[var(--color-outline)] text-center shadow-lg">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Crown1 size={32} variant="Bold" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--color-ink)]">
            Free Trial Sample Limit Reached
          </h2>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)] max-w-md mx-auto leading-relaxed">
            {error?.message ||
              'You have already sampled your 1 free trial topic. To access this topic and the complete syllabus across all subjects, upgrade to Scholar.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => openPaywall('topic_reader', error?.message)}
              className="w-full sm:w-auto h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md"
            >
              <Crown1 size={16} variant="Bold" className="mr-1.5" />
              Upgrade to Scholar
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/roadmap')}
              className="w-full sm:w-auto h-11 px-6 rounded-xl"
            >
              Back to Roadmap
            </Button>
          </div>
        </div>
      )
    }

    return (
      <ErrorState
        kind={errorKindFrom(error, online)}
        title="We could not open this topic"
        message="The notes for this topic did not load. Try again in a moment."
        onRetry={() => void refetch()}
        className="mt-8"
      />
    )
  }

  return (
    <article className="mx-auto w-full max-w-[720px] pb-4">
      {/* Pinned to the top of the page, above everything, so the actions are
          always one tap away while reading. */}
      <TopicActions topic={data} />

      {/* Breadcrumb */}
      <Link
        href="/roadmap"
        className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-3)] no-underline transition-colors hover:text-[var(--color-accent)]"
      >
        <ArrowLeft size={14} color="currentColor" variant="Linear" />
        {data.subjectName}
      </Link>

      <h1
        className="mb-3 text-[26px] font-medium leading-[1.25] text-[var(--color-ink)] sm:text-[32px]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {data.topicName}
      </h1>

      <p className="mb-8 text-[15px] leading-[1.7] text-[var(--color-ink-2)]">{data.intro}</p>

      {/* Sections — bullet points */}
      {data.sections.map((section) => (
        <section key={section.heading} className="mb-8">
          <h2
            className="mb-3 text-[17px] font-semibold text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {section.heading}
          </h2>
          <ul className="flex flex-col gap-2.5 pl-0">
            {section.points.map((point, i) => (
              <li key={i} className="flex gap-2.5 text-[14.5px] leading-[1.65] text-[var(--color-ink)]">
                <span
                  aria-hidden
                  className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
                <span className="min-w-0">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Worked examples */}
      {data.examples.length > 0 && (
        <section className="mb-8">
          <h2
            className="mb-3 flex items-center gap-2 text-[17px] font-semibold text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Lamp size={18} color="var(--color-accent)" variant="Bold" />
            Worked examples
          </h2>

          <div className="flex flex-col gap-4">
            {data.examples.map((example, idx) => (
              <div
                key={idx}
                className="rounded-[var(--radius-md)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4"
              >
                <p
                  className="mb-2 text-[14px] font-semibold text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {example.title}
                </p>
                <p className="mb-3 text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
                  {example.problem}
                </p>

                <ol className="mb-3 flex flex-col gap-2 pl-0">
                  {example.walkthrough.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-[14px] leading-[1.6] text-[var(--color-ink)]">
                      <span
                        className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                        style={{
                          backgroundColor: 'var(--color-accent-tint)',
                          color: 'var(--color-accent)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0">{step}</span>
                    </li>
                  ))}
                </ol>

                <p
                  className="rounded-[var(--radius-sm)] px-3 py-2 text-[14px] font-semibold"
                  style={{
                    backgroundColor: 'var(--color-success-tint)',
                    color: 'var(--color-success)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Answer: {example.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary */}
      {data.summary.length > 0 && (
        <section
          className="mb-8 rounded-[var(--radius-md)] border p-4"
          style={{
            borderColor: 'var(--color-accent)',
            backgroundColor: 'var(--color-accent-tint)',
          }}
        >
          <h2
            className="mb-3 flex items-center gap-2 text-[16px] font-semibold"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-accent)' }}
          >
            <Book1 size={17} color="currentColor" variant="Bold" />
            Summary
          </h2>
          <ul className="flex flex-col gap-2 pl-0">
            {data.summary.map((point, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] leading-[1.6] text-[var(--color-ink)]">
                <span aria-hidden className="shrink-0 font-semibold text-[var(--color-accent)]">
                  •
                </span>
                <span className="min-w-0">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Practise what you just read */}
      <div className="mb-8">
        <Button variant="accent" disabled={practicing} onClick={handleStartPractice}>
          <TaskSquare size={15} color="currentColor" variant="Linear" />
          {practicing ? 'Starting quiz...' : 'Practise this topic'}
        </Button>
      </div>

      {/* Move through the syllabus without going back to the list. There is no
          timer here — reading is not a race. */}
      <nav className="flex flex-col gap-2 border-t border-[var(--color-rule)] pt-4 sm:flex-row sm:justify-between">
        {data.previous ? (
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/topics/${data.previous.subjectSlug}/${data.previous.topicSlug}`}>
              <ArrowLeft size={14} color="currentColor" variant="Linear" />
              <span className="truncate">{data.previous.topicName}</span>
            </Link>
          </Button>
        ) : (
          <span />
        )}

        {data.next && (
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/topics/${data.next.subjectSlug}/${data.next.topicSlug}`}>
              <span className="truncate">{data.next.topicName}</span>
              <ArrowRight size={14} color="currentColor" variant="Linear" />
            </Link>
          </Button>
        )}
      </nav>
    </article>
  )
}
