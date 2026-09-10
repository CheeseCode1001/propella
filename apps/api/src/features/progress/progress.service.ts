import { prisma } from '../../config/db'
import { jsonArray, type RoadmapNodeJson, type SubjectTopic } from '../../models/types'

interface SubjectMastery {
  subjectSlug: string
  subjectName: string
  averageMastery: number
  topicsTotal: number
  topicsMastered: number
}

interface ActivityDay {
  date: string
  minutes: number
  sessions: number
}

interface ScoreDay {
  date: string
  averageScore: number
}

interface CoverageCounts {
  total: number
  covered: number
  inProgress: number
  remaining: number
}

interface SubjectCoverage extends CoverageCounts {
  subjectSlug: string
  subjectName: string
}

interface WeakTopicEntry {
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
  mastery: number
}

interface ProgressData {
  totalStudyHours: number
  topicsMastered: number
  quizzesTaken: number
  averageScore: number
  /** How much of the syllabus is done versus still ahead. */
  syllabusCoverage: CoverageCounts & { bySubject: SubjectCoverage[] }
  subjectMastery: SubjectMastery[]
  activityHeatmap: ActivityDay[]
  scoreTrend: ScoreDay[]
  weakestTopics: WeakTopicEntry[]
}

/** UTC day key, matching the `%Y-%m-%d` buckets the dashboard charts expect. */
function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export async function getProgress(userId: string): Promise<ProgressData> {
  const now = new Date()

  // Last 84 days for heatmap
  const heatmapStart = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000)
  // Last 30 days for score trend
  const scoreTrendStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [heatmapSessions, quizStats, trendAttempts, roadmap, allSessionsAgg] =
    await Promise.all([
      // Heatmap source rows — one user, 12 weeks, so grouping in JS is cheap and
      // avoids a raw date_trunc query.
      prisma.studySession.findMany({
        where: { userId, status: 'completed', startedAt: { gte: heatmapStart } },
        select: { startedAt: true, durationSec: true },
        orderBy: { startedAt: 'asc' },
      }),

      // Quiz stats (all time)
      prisma.quizAttempt.aggregate({
        where: { userId },
        _count: { _all: true },
        _avg: { score: true },
      }),

      // Score trend: last 30 days
      prisma.quizAttempt.findMany({
        where: { userId, createdAt: { gte: scoreTrendStart } },
        select: { createdAt: true, score: true },
        orderBy: { createdAt: 'asc' },
      }),

      // Roadmap for mastery data
      prisma.roadmap.findUnique({ where: { userId } }),

      // Total study time from all completed sessions (all time)
      prisma.studySession.aggregate({
        where: { userId, status: 'completed' },
        _sum: { durationSec: true },
      }),
    ])

  const totalStudyHours = (allSessionsAgg._sum.durationSec ?? 0) / 3600

  const quizzesTaken = quizStats._count._all
  const averageScore = Math.round(quizStats._avg.score ?? 0)

  const nodes = jsonArray<RoadmapNodeJson>(roadmap?.nodes)

  // Topics mastered
  const topicsMastered = nodes.filter((n) => n.mastery >= 80).length

  // Syllabus coverage. A topic counts as covered once it is completed; anything
  // started but unfinished is in progress; the rest is still ahead.
  const countCoverage = (subset: RoadmapNodeJson[]): CoverageCounts => ({
    total: subset.length,
    covered: subset.filter((n) => n.status === 'completed').length,
    inProgress: subset.filter(
      (n) => n.status === 'in-progress' || n.status === 'needs-revision',
    ).length,
    remaining: subset.filter((n) => n.status === 'locked' || n.status === 'ready').length,
  })

  // Subject mastery
  const subjectSlugs = [...new Set(nodes.map((n) => n.subjectSlug))]
  const subjects = await prisma.subject.findMany({
    where: { slug: { in: subjectSlugs } },
    select: { slug: true, name: true, topics: true },
  })
  const subjectMap = new Map(subjects.map((s) => [s.slug, s]))

  const subjectMastery: SubjectMastery[] = subjectSlugs.map((slug) => {
    const subjectNodes = nodes.filter((n) => n.subjectSlug === slug)
    const avgMastery =
      subjectNodes.length > 0
        ? Math.round(subjectNodes.reduce((acc, n) => acc + n.mastery, 0) / subjectNodes.length)
        : 0
    const mastered = subjectNodes.filter((n) => n.mastery >= 80).length
    return {
      subjectSlug: slug,
      subjectName: subjectMap.get(slug)?.name ?? slug,
      averageMastery: avgMastery,
      topicsTotal: subjectNodes.length,
      topicsMastered: mastered,
    }
  })

  // Activity heatmap — sum duration and count sessions per UTC day
  const activityByDay = new Map<string, { totalSec: number; count: number }>()
  for (const session of heatmapSessions) {
    const key = dayKey(session.startedAt)
    const bucket = activityByDay.get(key) ?? { totalSec: 0, count: 0 }
    bucket.totalSec += session.durationSec
    bucket.count += 1
    activityByDay.set(key, bucket)
  }

  const activityHeatmap: ActivityDay[] = [...activityByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => ({
      date,
      minutes: Math.round(bucket.totalSec / 60),
      sessions: bucket.count,
    }))

  // Score trend — average score per UTC day
  const scoresByDay = new Map<string, { total: number; count: number }>()
  for (const attempt of trendAttempts) {
    const key = dayKey(attempt.createdAt)
    const bucket = scoresByDay.get(key) ?? { total: 0, count: 0 }
    bucket.total += attempt.score
    bucket.count += 1
    scoresByDay.set(key, bucket)
  }

  const scoreTrend: ScoreDay[] = [...scoresByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => ({
      date,
      averageScore: Math.round(bucket.total / bucket.count),
    }))

  // Weakest topics
  const weakestTopics: WeakTopicEntry[] = nodes
    .filter((n) => n.mastery < 50)
    .sort((a, b) => a.mastery - b.mastery)
    .map((node) => {
      const subject = subjectMap.get(node.subjectSlug)
      const topic = jsonArray<SubjectTopic>(subject?.topics).find(
        (t) => t.slug === node.topicSlug,
      )
      return {
        subjectSlug: node.subjectSlug,
        subjectName: subject?.name ?? node.subjectSlug,
        topicSlug: node.topicSlug,
        topicName: topic?.name ?? node.topicSlug,
        mastery: node.mastery,
      }
    })

  const syllabusCoverage = {
    ...countCoverage(nodes),
    bySubject: subjectSlugs.map((slug) => ({
      subjectSlug: slug,
      subjectName: subjectMap.get(slug)?.name ?? slug,
      ...countCoverage(nodes.filter((n) => n.subjectSlug === slug)),
    })),
  }

  return {
    totalStudyHours: Math.round(totalStudyHours * 10) / 10,
    topicsMastered,
    quizzesTaken,
    averageScore,
    syllabusCoverage,
    subjectMastery,
    activityHeatmap,
    scoreTrend,
    weakestTopics,
  }
}
