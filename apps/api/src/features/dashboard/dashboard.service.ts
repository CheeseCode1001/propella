import { prisma } from '../../config/db'
import { AppError } from '../../middleware/error-handler'
import { getRank, getNextRank } from '@propella/shared'
import { jsonArray, type RoadmapNodeJson, type SubjectTopic } from '../../models/types'
import type {
  DashboardData,
  TodayTopic,
  WeakTopic,
  DailyScore,
  UpcomingRevision,
  UserStreak,
  XPSummary,
} from '@propella/shared'

export async function getDashboard(userId: string): Promise<DashboardData> {
  // 1. Fetch ExamProfile
  const examProfile = await prisma.examProfile.findUnique({ where: { userId } })
  if (!examProfile) {
    throw new AppError(404, 'Exam profile not found — please complete onboarding')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  })
  if (!user?.onboardingCompleted) {
    throw new AppError(404, 'Onboarding not complete')
  }

  const [roadmap, streakRow, xpAgg, recentAttempts] = await Promise.all([
    // 2. Roadmap
    prisma.roadmap.findUnique({ where: { userId } }),
    // 3. Streak
    prisma.streak.findUnique({ where: { userId } }),
    // 4. Total XP
    prisma.xPEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    // 8. Recent quiz scores: last 7 attempts
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 7,
      select: { createdAt: true, score: true },
    }),
  ])

  const streak: UserStreak = streakRow
    ? {
        currentStreak: streakRow.currentStreak,
        longestStreak: streakRow.longestStreak,
        lastActiveDate: streakRow.lastActiveDate.toISOString(),
        freezesAvailable: streakRow.freezesAvailable,
      }
    : {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString(),
        freezesAvailable: 1,
      }

  const totalXP = xpAgg._sum.amount ?? 0

  // 5. Compute rank
  const rank = getRank(totalXP)
  const nextRank = getNextRank(totalXP)

  const xp: XPSummary = {
    totalXP,
    rankName: rank.name,
    nextRankName: nextRank?.name ?? null,
    nextRankThreshold: nextRank?.threshold ?? null,
    xpToNextRank: nextRank ? nextRank.threshold - totalXP : null,
  }

  const nodes = jsonArray<RoadmapNodeJson>(roadmap?.nodes)

  // Load subjects for name resolution
  const subjectSlugs = [...new Set(nodes.map((n) => n.subjectSlug))]
  const subjects = await prisma.subject.findMany({
    where: { slug: { in: subjectSlugs } },
    select: { slug: true, name: true, topics: true },
  })

  const subjectMap = new Map(subjects.map((s) => [s.slug, s]))

  function topicOf(node: RoadmapNodeJson): SubjectTopic | undefined {
    const subject = subjectMap.get(node.subjectSlug)
    return jsonArray<SubjectTopic>(subject?.topics).find((t) => t.slug === node.topicSlug)
  }

  // 6. Today's planned topics
  const today = new Date()
  const todayTopics: TodayTopic[] = []

  for (const node of nodes) {
    if (
      new Date(node.plannedStartDate) <= today &&
      new Date(node.plannedEndDate) >= today &&
      (node.status === 'ready' || node.status === 'in-progress')
    ) {
      const topic = topicOf(node)

      todayTopics.push({
        subjectSlug: node.subjectSlug,
        subjectName: subjectMap.get(node.subjectSlug)?.name ?? node.subjectSlug,
        topicSlug: node.topicSlug,
        topicName: topic?.name ?? node.topicSlug,
        estimatedMinutes: topic?.estimatedMinutes ?? 30,
        status: node.status,
        nodeStatus: node.revisionsCompleted > 0 ? 'revision' : 'new',
      })
    }
  }

  // 7. Weakest topics: mastery < 50, sorted asc, limit 3
  const weakestTopics: WeakTopic[] = nodes
    .filter((n) => n.mastery < 50)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3)
    .map((node) => ({
      subjectSlug: node.subjectSlug,
      subjectName: subjectMap.get(node.subjectSlug)?.name ?? node.subjectSlug,
      topicSlug: node.topicSlug,
      topicName: topicOf(node)?.name ?? node.topicSlug,
      mastery: node.mastery,
    }))

  const recentScores: DailyScore[] = recentAttempts.map((attempt) => ({
    date: attempt.createdAt.toISOString().split('T')[0] ?? attempt.createdAt.toISOString(),
    averageScore: attempt.score,
  }))

  // 9. Upcoming revisions: nextRevisionAt within next 48 hours, status != 'locked'
  const in48Hours = new Date(today.getTime() + 48 * 60 * 60 * 1000)
  const upcomingRevisions: UpcomingRevision[] = []

  for (const node of nodes) {
    if (
      node.nextRevisionAt &&
      new Date(node.nextRevisionAt) <= in48Hours &&
      node.status !== 'locked'
    ) {
      upcomingRevisions.push({
        subjectSlug: node.subjectSlug,
        subjectName: subjectMap.get(node.subjectSlug)?.name ?? node.subjectSlug,
        topicSlug: node.topicSlug,
        topicName: topicOf(node)?.name ?? node.topicSlug,
        nextRevisionAt: new Date(node.nextRevisionAt).toISOString(),
      })
    }
  }

  const examDate = new Date(examProfile.examDate)
  const daysToExam = Math.max(
    0,
    Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  )

  return {
    daysToExam,
    examType: examProfile.examType,
    examTypes: examProfile.examTypes.length ? examProfile.examTypes : [examProfile.examType],
    examDate: examProfile.examDate.toISOString(),
    todayTopics,
    streak,
    xp,
    weakestTopics,
    recentScores,
    upcomingRevisions,
    examReadiness: roadmap?.examReadiness ?? 0,
  }
}
