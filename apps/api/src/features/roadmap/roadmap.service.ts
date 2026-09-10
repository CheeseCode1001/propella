import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { generateInitialRoadmap } from '../../lib/adaptive-engine'
import { notify } from '../notifications/notification.service'
import {
  jsonArray,
  type RoadmapNodeJson,
  type RoadmapNodeStatus,
  type SubjectTopic,
  type WeeklyTargetJson,
} from '../../models/types'
import type { Roadmap, RoadmapNode } from '@propella/shared'

const VALID_STATUSES: RoadmapNodeStatus[] = [
  'locked',
  'ready',
  'in-progress',
  'completed',
  'needs-revision',
]

export async function getRoadmap(userId: string): Promise<Roadmap> {
  const roadmap = await prisma.roadmap.findUnique({ where: { userId } })
  if (!roadmap) {
    throw new NotFoundError('Roadmap not found')
  }

  const nodes = jsonArray<RoadmapNodeJson>(roadmap.nodes)

  // Load all subjects referenced by the roadmap nodes
  const subjectSlugs = [...new Set(nodes.map((n) => n.subjectSlug))]
  const subjects = await prisma.subject.findMany({
    where: { slug: { in: subjectSlugs } },
    select: { slug: true, name: true, topics: true },
  })

  const subjectMap = new Map(subjects.map((s) => [s.slug, s]))

  const enrichedNodes: RoadmapNode[] = nodes.map((node) => {
    const subject = subjectMap.get(node.subjectSlug)
    const subjectTopics = jsonArray<SubjectTopic>(subject?.topics)
    const topic = subjectTopics.find((t) => t.slug === node.topicSlug)

    const enriched: RoadmapNode = {
      subjectSlug: node.subjectSlug,
      topicSlug: node.topicSlug,
      topicName: topic?.name ?? node.topicSlug,
      subjectName: subject?.name ?? node.subjectSlug,
      topicOrder: topic?.order ?? 0,
      topicTotal: subjectTopics.length,
      plannedStartDate: node.plannedStartDate,
      plannedEndDate: node.plannedEndDate,
      status: node.status,
      mastery: node.mastery,
      revisionsCompleted: node.revisionsCompleted,
      revisionsScheduled: node.revisionsScheduled,
      sm2: {
        easeFactor: node.sm2.easeFactor,
        interval: node.sm2.interval,
        repetitions: node.sm2.repetitions,
      },
      isMilestone: node.isMilestone,
      estimatedMinutes: topic?.estimatedMinutes ?? 30,
    }

    if (node.lastStudiedAt) enriched.lastStudiedAt = node.lastStudiedAt
    if (node.nextRevisionAt) enriched.nextRevisionAt = node.nextRevisionAt
    if (node.milestoneLabel) enriched.milestoneLabel = node.milestoneLabel

    return enriched
  })

  return {
    id: roadmap.id,
    userId: roadmap.userId,
    generatedAt: roadmap.generatedAt.toISOString(),
    examDate: roadmap.examDate.toISOString(),
    totalWeeks: roadmap.totalWeeks,
    examReadiness: roadmap.examReadiness,
    nodes: enrichedNodes,
    weeklyTargets: jsonArray<WeeklyTargetJson>(roadmap.weeklyTargets).map((wt) => ({
      weekStartDate: wt.weekStartDate,
      topicsToComplete: wt.topicsToComplete,
      minutesGoal: wt.minutesGoal,
      quizzesTargeted: wt.quizzesTargeted,
    })),
  }
}

/**
 * Loads the roadmap and locates one node. The nodes array is a jsonb blob, so
 * callers mutate the node in place and write the whole array back.
 */
async function loadNode(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
): Promise<{ nodes: RoadmapNodeJson[]; node: RoadmapNodeJson }> {
  const roadmap = await prisma.roadmap.findUnique({
    where: { userId },
    select: { nodes: true },
  })
  if (!roadmap) {
    throw new NotFoundError('Roadmap not found')
  }

  const nodes = jsonArray<RoadmapNodeJson>(roadmap.nodes)
  const node = nodes.find((n) => n.subjectSlug === subjectSlug && n.topicSlug === topicSlug)
  if (!node) {
    throw new NotFoundError(`Node not found: ${subjectSlug}/${topicSlug}`)
  }

  return { nodes, node }
}

export async function updateNodeStatus(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
  status: string,
): Promise<void> {
  if (!VALID_STATUSES.includes(status as RoadmapNodeStatus)) {
    throw new AppError(400, `Invalid status: ${status}`)
  }

  const { nodes, node } = await loadNode(userId, subjectSlug, topicSlug)

  const prevStatus = node.status
  node.status = status as RoadmapNodeStatus

  await prisma.roadmap.update({ where: { userId }, data: { nodes } })

  if (prevStatus === 'locked' && status === 'ready') {
    await notify(userId, 'topic_unlocked', {
      title: `New topic unlocked`,
      body: `${topicSlug.replace(/-/g, ' ')} is now available on your roadmap.`,
      deeplink: `/roadmap/${subjectSlug}/${topicSlug}`,
      metadata: { topicId: topicSlug, subjectSlug },
    })
  }
}

export async function updateNodeMastery(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
  mastery: number,
): Promise<void> {
  if (mastery < 0 || mastery > 100) {
    throw new AppError(400, 'Mastery must be between 0 and 100')
  }

  const { nodes, node } = await loadNode(userId, subjectSlug, topicSlug)

  node.mastery = mastery

  if (mastery >= 80 && node.revisionsCompleted >= 1) {
    node.status = 'completed'
  }

  await prisma.roadmap.update({ where: { userId }, data: { nodes } })
}

export async function regenerateRoadmap(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!user) {
    throw new NotFoundError('User not found')
  }

  const profile = await prisma.examProfile.findUnique({ where: { userId } })
  if (!profile) {
    throw new NotFoundError('Exam profile not found')
  }

  await generateInitialRoadmap(userId, profile)
}
