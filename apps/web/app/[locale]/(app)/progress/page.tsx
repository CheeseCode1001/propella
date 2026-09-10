'use client'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Chart2 } from 'iconsax-reactjs'
import { EmptyState } from '@/components/common/empty-state'
import { BadgeShelf } from '@/components/progress/badge-shelf'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from '@/lib/i18n/navigation'

interface ProgressData {
  totalStudyHours: number
  topicsMastered: number
  quizzesTaken: number
  averageScore: number
  syllabusCoverage: {
    total: number
    covered: number
    inProgress: number
    remaining: number
    bySubject: Array<{
      subjectSlug: string
      subjectName: string
      total: number
      covered: number
      inProgress: number
      remaining: number
    }>
  }
  subjectMastery: Array<{
    subjectSlug: string
    subjectName: string
    averageMastery: number
    topicsTotal: number
    topicsMastered: number
  }>
  activityHeatmap: Array<{ date: string; minutes: number; sessions: number }>
  scoreTrend: Array<{ date: string; averageScore: number }>
  weakestTopics: Array<{
    subjectSlug: string
    subjectName: string
    topicSlug: string
    topicName: string
    mastery: number
  }>
}

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

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string
  value: string | number
  suffix?: string
}) {
  return (
    <Card>
      <CardContent style={{ paddingTop: 20 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}
        >
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 500,
              color: 'var(--color-ink)',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </span>
          {suffix && (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                color: 'var(--color-ink-2)',
              }}
            >
              {suffix}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityHeatmap({ days }: { days: Array<{ date: string; minutes: number }> }) {
  const today = new Date()
  const weeks = 12
  const totalDays = weeks * 7

  // Build a map from date string to minutes
  const minuteMap = new Map(days.map((d) => [d.date, d.minutes]))

  // Build grid starting from (today - totalDays + 1)
  const cells: Array<{ date: string; minutes: number; dayOfWeek: number }> = []
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    cells.push({
      date: dateStr,
      minutes: minuteMap.get(dateStr) ?? 0,
      dayOfWeek: d.getDay(),
    })
  }

  // Group into weeks
  const weekGroups: typeof cells[] = []
  for (let w = 0; w < weeks; w++) {
    weekGroups.push(cells.slice(w * 7, w * 7 + 7))
  }

  // Month labels
  const monthLabels: Array<{ month: string; weekIdx: number }> = []
  let lastMonth = ''
  weekGroups.forEach((week, wi) => {
    const firstDay = week[0]
    if (!firstDay) return
    const month = new Date(firstDay.date).toLocaleString('default', { month: 'short' })
    if (month !== lastMonth) {
      monthLabels.push({ month, weekIdx: wi })
      lastMonth = month
    }
  })

  function cellOpacity(minutes: number): number {
    if (minutes === 0) return 0
    if (minutes < 15) return 0.25
    if (minutes < 30) return 0.5
    if (minutes < 60) return 0.75
    return 1
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Month labels */}
      <div style={{ display: 'flex', marginBottom: 4, paddingLeft: 0 }}>
        {weekGroups.map((_, wi) => {
          const label = monthLabels.find((m) => m.weekIdx === wi)
          return (
            <div
              key={wi}
              style={{
                width: 14,
                marginRight: 2,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--color-ink-3)',
                flexShrink: 0,
              }}
            >
              {label?.month ?? ''}
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: 2 }}>
        {weekGroups.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.minutes} min`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor:
                    cell.minutes === 0
                      ? 'var(--color-paper-3)'
                      : `rgba(178, 58, 46, ${cellOpacity(cell.minutes)})`,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () =>
      api.get<{ data: ProgressData }>('/progress').then((r) => r.data),
  })
  const t = useTranslations('progress')

  const hasData =
    data &&
    (data.totalStudyHours > 0 ||
      data.quizzesTaken > 0 ||
      data.topicsMastered > 0)

  if (isLoading) {
    return (
      <div style={{ width: "100%", margin: '0 auto' }}>
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!hasData) {
    return (
      <div style={{ width: "100%", margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 500,
            color: 'var(--color-ink)',
            marginBottom: 32,
          }}
        >
          {t('title')}
        </h1>
        <EmptyState
          icon={Chart2}
          title="Your progress starts here"
          message="Finish a study session or a quiz and your hours, mastery and coverage will begin to build."
        />
      </div>
    )
  }

  const chartData = (data.scoreTrend ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: d.averageScore,
  }))

  const coverage = data.syllabusCoverage
  const pct = (n: number) => (coverage.total > 0 ? (n / coverage.total) * 100 : 0)
  const coveragePct = Math.round(pct(coverage.covered))

  return (
    <div style={{ width: "100%", margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 40,
          fontWeight: 500,
          color: 'var(--color-ink)',
          marginBottom: 32,
        }}
      >
        {t('title')}
      </h1>

      {/* Key numbers */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        style={{ marginBottom: 32 }}
      >
        <StatCard label="Study hours" value={data.totalStudyHours} />
        <StatCard label="Topics mastered" value={data.topicsMastered} />
        <StatCard label="Quizzes taken" value={data.quizzesTaken} />
        <StatCard label="Average score" value={data.averageScore} suffix="%" />
      </div>

      {/* Syllabus coverage — what is done vs what is left */}
      {data.syllabusCoverage.total > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Syllabus coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  color: 'var(--color-ink)',
                }}
              >
                {coveragePct}%
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--color-ink-3)',
                }}
              >
                {data.syllabusCoverage.covered} of {data.syllabusCoverage.total} topics covered
              </span>
            </div>

            {/* Stacked bar: covered / in progress / remaining */}
            <div
              style={{
                display: 'flex',
                height: 10,
                borderRadius: 999,
                overflow: 'hidden',
                backgroundColor: 'var(--color-paper-3)',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: `${pct(data.syllabusCoverage.covered)}%`,
                  backgroundColor: 'var(--color-success)',
                }}
              />
              <div
                style={{
                  width: `${pct(data.syllabusCoverage.inProgress)}%`,
                  backgroundColor: 'var(--color-warning)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Covered', value: data.syllabusCoverage.covered, color: 'var(--color-success)' },
                { label: 'In progress', value: data.syllabusCoverage.inProgress, color: 'var(--color-warning)' },
                { label: 'Left', value: data.syllabusCoverage.remaining, color: 'var(--color-paper-3)' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 3,
                      backgroundColor: item.color,
                      border: '1px solid var(--color-rule-2)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--color-ink-2)' }}>
                    {item.label}
                    {' \u00b7 '}
                    <strong style={{ color: 'var(--color-ink)' }}>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>

            {/* Per subject */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.syllabusCoverage.bySubject.map((s) => {
                const subjectPct =
                  s.total > 0 ? Math.round((s.covered / s.total) * 100) : 0
                return (
                  <div key={s.subjectSlug} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        color: 'var(--color-ink-2)',
                        width: 120,
                        flexShrink: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.subjectName}
                    </p>
                    <div
                      style={{
                        flex: 1,
                        height: 7,
                        borderRadius: 999,
                        backgroundColor: 'var(--color-paper-3)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${subjectPct}%`,
                          height: '100%',
                          backgroundColor: getSubjectColor(s.subjectSlug),
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11.5,
                        color: 'var(--color-ink-3)',
                        width: 74,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {s.covered}/{s.total} done
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject mastery bars */}
      {data.subjectMastery.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Subject mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.subjectMastery.map((s) => (
                <div key={s.subjectSlug} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      color: 'var(--color-ink-2)',
                      width: 120,
                      flexShrink: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.subjectName}
                  </p>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      backgroundColor: 'var(--color-paper-3)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${s.averageMastery}%`,
                        backgroundColor: getSubjectColor(s.subjectSlug),
                        borderRadius: 4,
                        transition: 'width 0.6s ease',
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
                    {s.averageMastery}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity heatmap */}
      <Card style={{ marginBottom: 24 }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Activity (12 weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap days={data.activityHeatmap} />
        </CardContent>
      </Card>

      {/* Score trend */}
      {chartData.length > 1 && (
        <Card style={{ marginBottom: 24 }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Score trend (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    fill: 'var(--color-ink-3)',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--color-ink-3)' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
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
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <BadgeShelf />

      {/* Weakest topics table */}
      {data.weakestTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Weakest topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto auto',
                gap: '8px 16px',
              }}
            >
              {/* Headers */}
              {['Topic', 'Subject', 'Mastery', ''].map((h, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--color-ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--color-rule)',
                  }}
                >
                  {h}
                </p>
              ))}

              {data.weakestTopics.slice(0, 10).map((t) => (
                <>
                  <p
                    key={`topic-${t.topicSlug}`}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      color: 'var(--color-ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingTop: 4,
                      paddingBottom: 4,
                    }}
                  >
                    {t.topicName}
                  </p>
                  <p
                    key={`subject-${t.topicSlug}`}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      color: 'var(--color-ink-3)',
                      paddingTop: 4,
                      paddingBottom: 4,
                    }}
                  >
                    {t.subjectName}
                  </p>
                  <div
                    key={`mastery-${t.topicSlug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      paddingTop: 4,
                      paddingBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 4,
                        backgroundColor: 'var(--color-paper-3)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${t.mastery}%`,
                          backgroundColor: 'var(--color-accent)',
                          borderRadius: 2,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--color-ink-3)',
                      }}
                    >
                      {t.mastery}%
                    </span>
                  </div>
                  <div
                    key={`action-${t.topicSlug}`}
                    style={{ paddingTop: 4, paddingBottom: 4 }}
                  >
                    <Button variant="link" size="sm" asChild>
                      <Link
                        href={`/quizzes/new?subject=${t.subjectSlug}&topic=${t.topicSlug}`}
                      >
                        Practice
                      </Link>
                    </Button>
                  </div>
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
