'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter, Link } from '@/lib/i18n/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Book1, Lamp, TaskSquare, Crown1, TickCircle } from 'iconsax-reactjs'
import { Lock } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'
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

interface TopicQuizResult {
  attemptId: string
  quizId: string
  score: number
  totalQuestions: number
  correctCount: number
  completedAt: string
  durationSec: number
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
  quizResult?: TopicQuizResult | null
  isCompleted?: boolean
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
  const locale = (params.locale as string) || 'en'
  const t = useTranslations('topics')
  const online = useOnlineStatus()
  const router = useRouter()
  const queryClient = useQueryClient()
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
        locale,
      })
      router.push('/quizzes/' + res.data.quizId)
    } catch {
      router.push('/quizzes/new?subject=' + data.subjectSlug + '&topic=' + data.topicSlug)
    } finally {
      setPracticing(false)
    }
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['topic-reader', subjectSlug, topicSlug, locale],
    queryFn: () =>
      api
        .get<{ data: TopicReader }>(`/topics/${subjectSlug}/${topicSlug}?locale=${encodeURIComponent(locale)}`)
        .then((r) => r.data),
    staleTime: 60 * 60 * 1000,
  })

  if (isLoading) return <ReaderSkeleton />

  const isPaywallError = Boolean(
    error?.message &&
      (error.message.toLowerCase().includes('trial') ||
        error.message.toLowerCase().includes('paywall') ||
        error.message.toLowerCase().includes('scholar') ||
        error.message.toLowerCase().includes('limit')),
  )

  if (isError || !data) {
    if (isPaywallError) {
      return (
        <div className="relative mx-auto w-full max-w-[620px] my-10 rounded-3xl border border-amber-500/25 bg-[var(--color-paper)] p-8 sm:p-10 shadow-2xl text-center overflow-hidden">
          {/* Ambient radial amber aura */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl pointer-events-none" />

          {/* Crown emblem */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-5">
            <Crown1 size={36} variant="Bold" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-3">
            <Crown1 size={14} variant="Bold" />
            Scholar Plan Required
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
            Free Trial Sample Limit Reached
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[var(--color-ink-muted)] max-w-lg mx-auto leading-relaxed">
            {error?.message ||
              'You have reached your Free Trial limit of 1 sample topic. Upgrade to Scholar to unlock all topics across all subjects.'}
          </p>

          {/* Feature benefits highlight */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {[
              {
                title: 'All Topics Unlocked',
                desc: 'Full access to all 12 secondary subjects without locks',
              },
              {
                title: '24/7 AI Personal Tutor',
                desc: 'Step-by-step solutions and custom study queries',
              },
              {
                title: 'JAMB & WAEC CBT Mocks',
                desc: 'Official exam-hall simulation with automatic marking',
              },
              {
                title: 'Adaptive Practice Quizzes',
                desc: 'Over 10,000 curated past questions with instant answers',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-[var(--color-paper-2)]/90 backdrop-blur-sm border border-[var(--color-outline)]/70"
              >
                <div className="mt-0.5 text-amber-500 shrink-0">
                  <TickCircle size={16} variant="Bold" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--color-ink)]">{item.title}</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)] leading-tight mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => openPaywall('topic_reader', error?.message)}
              className="w-full sm:w-auto h-12 px-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Crown1 size={18} variant="Bold" />
              Upgrade to Scholar · From ₦1,999
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/roadmap')}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl"
            >
              Back to Roadmap
            </Button>
          </div>

          <p className="mt-4 text-[11px] text-[var(--color-ink-muted)]">
            Instant activation across all devices · Trusted by students nationwide
          </p>
        </div>
      )
    }

    return (
      <ErrorState
        kind={errorKindFrom(error, online)}
        title={t('errorTitle')}
        message={t('errorMessage')}
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
            {t('examplesAndSolutions')}
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
                  {t('finalAnswer')}: {example.answer}
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
            {t('summaryAndKeyTakeaways')}
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

      {/* Practice Test & Topic Completion Section */}
      {data.quizResult ? (
        <section className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <TickCircle size={14} variant="Bold" />
                  Practice Test Taken · Topic Completed
                </span>
                <span className="text-xs text-[var(--color-ink-muted)]">
                  {format(new Date(data.quizResult.completedAt), 'MMM d, yyyy')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">
                Latest Score: {data.quizResult.score}% ({data.quizResult.correctCount}/{data.quizResult.totalQuestions} Questions Correct)
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                You have completed this topic. The next topic on your syllabus is unlocked and ready.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Button
                variant="accent"
                size="sm"
                disabled={practicing}
                onClick={handleStartPractice}
                className="gap-1.5"
              >
                <TaskSquare size={15} />
                {practicing ? t('preparingQuiz') : 'Retake Practice Test'}
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/quizzes/${data.quizResult.quizId}/results/${data.quizResult.attemptId}`}>
                  Review Answers
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Lock size={14} />
                Next Topic Locked
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink)]">
                Take the Practice Test to Unlock the Next Topic
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-0.5 max-w-md">
                Answer 10 practice questions on this topic to test your recall, mark the topic as completed, and unlock the next lesson.
              </p>
            </div>

            <Button
              variant="accent"
              disabled={practicing}
              onClick={handleStartPractice}
              className="shrink-0 gap-2 h-11 px-5 shadow-md"
            >
              <TaskSquare size={16} variant="Linear" />
              {practicing ? t('preparingQuiz') : 'Start Practice Test (10 Qs)'}
            </Button>
          </div>
        </section>
      )}

      {/* Move through the syllabus. Previous is always available so students can go back and re-read anytime.
          Next is strictly locked until the practice quiz for this topic has been taken. */}
      <nav className="flex flex-col gap-3 border-t border-[var(--color-rule)] pt-4 sm:flex-row sm:justify-between sm:items-center">
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
          (data.quizResult || data.isCompleted) ? (
            <Button variant="accent" size="sm" asChild>
              <Link href={`/topics/${data.next.subjectSlug}/${data.next.topicSlug}`}>
                <span className="truncate">{data.next.topicName}</span>
                <ArrowRight size={14} color="currentColor" variant="Linear" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="opacity-50 cursor-not-allowed flex items-center gap-1.5"
                title="Complete the practice test above to unlock this topic"
              >
                <Lock size={13} className="text-[var(--color-ink-muted)]" />
                <span className="truncate">{data.next.topicName}</span>
              </Button>
              <span className="text-[11px] text-[var(--color-ink-3)] hidden sm:inline font-medium">
                (Take practice test to unlock)
              </span>
            </div>
          )
        )}
      </nav>
    </article>
  )
}
