'use client'
import { format } from 'date-fns'
import { Check, ArrowRight, Flame } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import {
  AreaChart, Area, XAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import { useTranslations } from 'next-intl'
import { useDashboard } from '@/lib/hooks/use-dashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { NumberCounter } from '@/components/common/number-counter'
import { Calendar, Chart2, RefreshCircle } from 'iconsax-reactjs'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState, errorKindFrom } from '@/components/common/error-state'
import { useOnlineStatus } from '@/lib/hooks/use-online-status'
import type { TodayTopic, WeakTopic, DailyScore, UpcomingRevision } from '@propella/shared'
import { formatDistanceToNow } from 'date-fns'

function getSubjectColor(slug: string): string {
  const map: Record<string, string> = {
    english: 'var(--color-subj-english)',
    mathematics: 'var(--color-subj-math)',
    physics: 'var(--color-subj-physics)',
    chemistry: 'var(--color-subj-chemistry)',
    biology: 'var(--color-subj-biology)',
    economics: 'var(--color-subj-economics)',
    government: 'var(--color-subj-government)',
    literature: 'var(--color-subj-literature)',
  }
  return map[slug] ?? 'var(--color-subj-default)'
}

function statusBadgeVariant(status: string) {
  if (status === 'completed') return 'success' as const
  if (status === 'in-progress') return 'accent' as const
  if (status === 'needs-revision') return 'warning' as const
  if (status === 'locked') return 'default' as const
  return 'default' as const
}

function statusLabel(status: string) {
  if (status === 'in-progress') return 'In Progress'
  if (status === 'needs-revision') return 'Needs Revision'
  if (status === 'completed') return 'Completed'
  if (status === 'ready') return 'Ready'
  if (status === 'locked') return 'Locked'
  return status
}

// Skeleton versions of each card section
function TodayFocusSkeleton() {
  return (
    <Card className="lg:col-span-8">
      <CardHeader>
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-1 h-6 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StreakSkeleton() {
  return (
    <Card className="lg:col-span-4">
      <CardContent className="flex flex-col items-center py-4 gap-3">
        <Skeleton className="h-14 w-24" />
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="rounded-full" style={{ width: 6, height: 6 }} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function GenericSkeleton({ colSpan }: { colSpan: string }) {
  return (
    <Card className={colSpan}>
      <CardHeader>
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  )
}

// Today's Focus card
function TodayFocusCard({ topics }: { topics: TodayTopic[] }) {
  const firstReady = topics.findIndex((t) => t.status === 'ready' || t.status === 'in-progress')

  return (
    <Card className="lg:col-span-8">
      <CardHeader>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--color-ink-3)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Today
        </p>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16 }}>
          {topics.length} topic{topics.length !== 1 ? 's' : ''} scheduled
          {' · '}
          {topics.reduce((a, t) => a + t.estimatedMinutes, 0)} min planned
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nothing scheduled today"
            message="Enjoy the breather, or pick a topic and get a head start."
            action={
              <Button variant="link" asChild>
                <Link href="/roadmap">Browse roadmap</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-rule)]">
            {topics.map((topic, idx) => (
              <div key={`${topic.subjectSlug}-${topic.topicSlug}`} className="flex items-center gap-3 py-3">
                <div
                  style={{
                    width: 4,
                    height: 24,
                    borderRadius: 2,
                    backgroundColor: getSubjectColor(topic.subjectSlug),
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    fontSize: 15,
                    color: 'var(--color-ink)',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {topic.topicName}
                </span>
                <Badge variant={statusBadgeVariant(topic.status)}>{statusLabel(topic.status)}</Badge>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--color-ink-3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {topic.estimatedMinutes} min
                </span>
                {idx === firstReady && (
                  <Button variant="accent" size="sm" asChild>
                    <Link href={`/study/new?subject=${topic.subjectSlug}&topic=${topic.topicSlug}`}>Start</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-[var(--color-rule)]">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/planner" className="flex items-center gap-1.5">
              View full planner <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Streak card
function StreakCard({
  currentStreak,
  longestStreak,
  lastActiveDate,
}: {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
}) {
  const t = useTranslations('dashboard')
  // Build 7-day history dots (today + last 6 days)
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  // Estimate which days were active based on lastActiveDate and streak
  const lastActive = new Date(lastActiveDate)
  const dots = last7.map((d, i) => {
    const isToday = i === 6
    const daysDiff = Math.floor((lastActive.getTime() - d.getTime()) / 86400000)
    const studied = daysDiff >= 0 && daysDiff < currentStreak
    return { isToday, studied }
  })

  return (
    <Card className="lg:col-span-4">
      <CardContent className="flex flex-col items-center text-center py-4">
        <NumberCounter
          value={currentStreak}
          className="text-[56px] leading-none text-[var(--color-ink)]"
        />
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-ink-2)',
            marginTop: 6,
            marginBottom: 12,
          }}
        >
          {t('streakLabel', { count: currentStreak })}
        </p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {dots.map((dot, i) => (
            <div
              key={i}
              style={{
                width: dot.isToday ? 8 : 6,
                height: dot.isToday ? 8 : 6,
                borderRadius: '50%',
                backgroundColor: dot.studied ? 'var(--color-accent)' : 'transparent',
                border: dot.studied ? 'none' : '1.5px solid var(--color-ink-3)',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Flame size={14} strokeWidth={1.5} style={{ color: 'var(--color-ink-3)' }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink-3)' }}>
            Longest: {longestStreak} days
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// XP & Rank card
function XPRankCard({
  totalXP,
  rankName,
  nextRankName,
  xpToNextRank,
  nextRankThreshold,
}: {
  totalXP: number
  rankName: string
  nextRankName: string | null
  xpToNextRank: number | null
  nextRankThreshold: number | null
}) {
  const progress =
    nextRankThreshold && xpToNextRank != null
      ? Math.max(0, Math.min(100, ((nextRankThreshold - xpToNextRank) / nextRankThreshold) * 100))
      : 100

  return (
    <Card className="lg:col-span-6">
      <CardHeader className="mb-2">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--color-ink-3)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Rank
        </p>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 22,
            color: 'var(--color-ink)',
          }}
        >
          {rankName}
        </h3>
      </CardHeader>
      <CardContent>
        <div
          style={{
            height: 4,
            backgroundColor: 'var(--color-paper-3)',
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--color-accent)',
              borderRadius: 2,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)' }}>
          {xpToNextRank != null && nextRankName
            ? `${xpToNextRank.toLocaleString()} XP to ${nextRankName}`
            : `${totalXP.toLocaleString()} XP total — Max rank reached`}
        </p>
      </CardContent>
    </Card>
  )
}

// Weakest topics card
function WeakestTopicsCard({ topics }: { topics: WeakTopic[] }) {
  const t = useTranslations('dashboard')
  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
          {t('weakestTopics')}
        </CardTitle>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-3)', marginTop: 4 }}>
          Topics with the lowest mastery
        </p>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-3)' }}>
            Nothing critical right now. You are holding the line.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {topics.slice(0, 3).map((topic) => (
              <div key={`${topic.subjectSlug}-${topic.topicSlug}`} className="flex items-center gap-3">
                <div
                  style={{
                    width: 4,
                    height: 24,
                    borderRadius: 2,
                    backgroundColor: getSubjectColor(topic.subjectSlug),
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--color-ink)',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {topic.topicName}
                </span>
                {/* inline mastery bar */}
                <div
                  style={{
                    width: 64,
                    height: 4,
                    backgroundColor: 'var(--color-paper-3)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${topic.mastery}%`,
                      backgroundColor: 'var(--color-accent)',
                      borderRadius: 2,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--color-ink-3)',
                    flexShrink: 0,
                    width: 36,
                    textAlign: 'right',
                  }}
                >
                  {topic.mastery}%
                </span>
                <Button variant="link" size="sm" asChild>
                  <Link href={`/quizzes/new?subject=${topic.subjectSlug}&topic=${topic.topicSlug}`}>
                    Practice
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Performance trend chart
function PerformanceTrendCard({ scores }: { scores: DailyScore[] }) {
  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + s.averageScore, 0) / scores.length)
      : 0
  const prev = scores.length > 1 ? scores[scores.length - 2]!.averageScore : avg
  const delta = avg - prev

  const chartData = scores.map((s) => ({
    date: format(new Date(s.date), 'MMM d'),
    score: Math.round(s.averageScore),
  }))

  return (
    <Card className="lg:col-span-7">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Last 7 days</CardTitle>
      </CardHeader>
      <CardContent>
        {scores.length === 0 ? (
          <EmptyState
            icon={Chart2}
            title="No scores yet this week"
            message="Take a quiz and your progress will start showing up here."
          />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--color-ink-3)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-rule)',
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: 'var(--font-sans)',
                  }}
                  formatter={(v: number) => [`${v}%`, 'Score']}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-2 mt-3">
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)' }}>
                Average score this week: {avg}%
              </span>
              {delta !== 0 && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: delta > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                    fontWeight: 600,
                  }}
                >
                  {delta > 0 ? '+' : ''}{delta}%
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Upcoming revisions card
function UpcomingRevisionsCard({ revisions }: { revisions: UpcomingRevision[] }) {
  // The API already returns only revisions due within 48 hours.
  const soon = revisions

  return (
    <Card className="lg:col-span-5">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Due for revision</CardTitle>
      </CardHeader>
      <CardContent>
        {soon.length === 0 ? (
          <EmptyState
            icon={RefreshCircle}
            title="Nothing to revise yet"
            message="Revisions appear here once you have studied a topic. You are on track."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {soon.slice(0, 3).map((r) => (
              <div key={`${r.subjectSlug}-${r.topicSlug}`} className="flex items-center gap-3">
                <div
                  style={{
                    width: 4,
                    height: 24,
                    borderRadius: 2,
                    backgroundColor: getSubjectColor(r.subjectSlug),
                    flexShrink: 0,
                  }}
                />
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
                    {r.topicName}
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink-3)' }}>
                    {formatDistanceToNow(new Date(r.nextRevisionAt), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/study/new?subject=${r.subjectSlug}&topic=${r.topicSlug}&mode=revision`}>
                    Revise
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Exam readiness card
function ExamReadinessCard({ readiness }: { readiness: number }) {
  return (
    <Card className="lg:col-span-12">
      <CardHeader>
        <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Exam readiness</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 48,
              fontWeight: 500,
              color: 'var(--color-ink)',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {readiness}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--color-ink-2)' }}>%</span>
        </div>
        <div
          style={{
            height: 4,
            backgroundColor: 'var(--color-paper-3)',
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${readiness}%`,
              backgroundColor: readiness >= 70 ? 'var(--color-success)' : 'var(--color-accent)',
              borderRadius: 2,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 16 }}>
          Based on topic mastery, quiz scores, and revision progress
        </p>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/mocks/new">Take a mock</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard()
  const t = useTranslations('dashboard')
  const online = useOnlineStatus()

  const today = new Date()
  const dateLabel = format(today, 'EEEE, MMMM d.')

  // Only take over the page when there is nothing cached to show. With a saved
  // copy in hand the student keeps their dashboard and just sees the banner.
  if (isError && !data) {
    return (
      <ErrorState
        kind={errorKindFrom(error, online)}
        onRetry={() => void refetch()}
        className="mt-8"
      />
    )
  }

  return (
    <div>
      {/* Above grid: date + countdown */}
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-ink-3)',
            marginBottom: 6,
          }}
        >
          {dateLabel}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 500,
            color: 'var(--color-ink)',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {isLoading ? (
            <Skeleton className="h-9 w-48 inline-block" />
          ) : (
            <>
              {data?.daysToExam != null
                ? t('daysToExam', { days: data.daysToExam, exam: data.examType?.toUpperCase() ?? 'exam' })
                : '—'}
            </>
          )}
        </h1>
      </div>

      {/* 12-col grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {isLoading ? (
          <>
            <TodayFocusSkeleton />
            <StreakSkeleton />
            <GenericSkeleton colSpan="lg:col-span-5" />
            <GenericSkeleton colSpan="lg:col-span-7" />
            <GenericSkeleton colSpan="lg:col-span-6" />
            <GenericSkeleton colSpan="lg:col-span-6" />
            <GenericSkeleton colSpan="lg:col-span-12" />
          </>
        ) : data ? (
          <>
            {/* Today's focus - 8 cols */}
            <TodayFocusCard topics={data.todayTopics} />

            {/* Streak - 4 cols */}
            <StreakCard
              currentStreak={data.streak.currentStreak}
              longestStreak={data.streak.longestStreak}
              lastActiveDate={data.streak.lastActiveDate}
            />

            {/* XP & Rank - 4 cols (below streak) */}
            <XPRankCard
              totalXP={data.xp.totalXP}
              rankName={data.xp.rankName}
              nextRankName={data.xp.nextRankName}
              xpToNextRank={data.xp.xpToNextRank}
              nextRankThreshold={data.xp.nextRankThreshold}
            />

            {/* Weakest topics - 6 cols */}
            <WeakestTopicsCard topics={data.weakestTopics} />

            {/* Performance trend - 6 cols */}
            <PerformanceTrendCard scores={data.recentScores} />

            {/* Upcoming revisions - 6 cols */}
            <UpcomingRevisionsCard revisions={data.upcomingRevisions} />

            {/* Exam readiness - 6 cols */}
            <ExamReadinessCard readiness={data.examReadiness} />
          </>
        ) : null}
      </div>
    </div>
  )
}
