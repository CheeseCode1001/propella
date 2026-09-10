import { differenceInWeeks, addDays, startOfDay } from 'date-fns'
import type { ExamProfile } from '../config/db'
import { prisma } from '../config/db'
import {
  jsonArray,
  type ExamProfileSubject,
  type RoadmapNodeJson,
  type SubjectTopic,
  type WeeklyTargetJson,
} from '../models/types'

export async function generateInitialRoadmap(
  userId: string,
  profile: ExamProfile,
): Promise<void> {
  const selectedExamTypes = profile.examTypes.length ? profile.examTypes : [profile.examType]
  const profileSubjects = jsonArray<ExamProfileSubject>(profile.subjects)

  const subjects = await prisma.subject.findMany({
    where: {
      slug: { in: profileSubjects.map((s) => s.slug) },
      examTypes: { hasSome: selectedExamTypes },
    },
  })

  const examDate = new Date(profile.examDate)
  const now = new Date()
  const totalWeeks = Math.max(1, differenceInWeeks(examDate, now))

  const nodes: RoadmapNodeJson[] = []

  let dayOffset = 0

  for (const subject of subjects) {
    const profileSubject = profileSubjects.find((s) => s.slug === subject.slug)
    const timeMultiplier = profileSubject?.isWeak ? 1.3 : profileSubject?.isStrong ? 0.8 : 1.0

    const subjectTopics = jsonArray<SubjectTopic>(subject.topics)
      .filter((t) => t.examTypes.some((examType) => selectedExamTypes.includes(examType)))
      .sort((a, b) => a.order - b.order)

    for (let i = 0; i < subjectTopics.length; i++) {
      const topic = subjectTopics[i]!
      const studyMinutesPerDay = profile.dailyStudyMinutes
      const estimatedDays = Math.max(
        1,
        Math.round((topic.estimatedMinutes * timeMultiplier) / studyMinutesPerDay),
      )

      const plannedStart = startOfDay(addDays(now, dayOffset))
      const plannedEnd = startOfDay(addDays(plannedStart, estimatedDays))
      dayOffset += estimatedDays

      const isMilestone = (i + 1) % 5 === 0 || i === subjectTopics.length - 1
      const milestoneLabel = isMilestone
        ? i === subjectTopics.length - 1
          ? `${subject.name} Complete`
          : `${subject.name} Checkpoint`
        : undefined

      // Dates inside a jsonb column are ISO strings — see models/types.ts.
      const node: RoadmapNodeJson = {
        subjectSlug: subject.slug,
        topicSlug: topic.slug,
        plannedStartDate: plannedStart.toISOString(),
        plannedEndDate: plannedEnd.toISOString(),
        status: i === 0 ? 'ready' : 'locked',
        mastery: 0,
        revisionsCompleted: 0,
        revisionsScheduled: 1,
        sm2: { easeFactor: 2.5, interval: 1, repetitions: 0 },
        isMilestone,
        ...(milestoneLabel !== undefined ? { milestoneLabel } : {}),
        nextRevisionAt: addDays(plannedEnd, 1).toISOString(),
      }

      nodes.push(node)
    }
  }

  const weeklyTargets: WeeklyTargetJson[] = Array.from(
    { length: totalWeeks },
    (_, w): WeeklyTargetJson => ({
      weekStartDate: addDays(now, w * 7).toISOString(),
      topicsToComplete: Math.ceil(nodes.length / totalWeeks),
      minutesGoal: profile.dailyStudyMinutes * 7,
      quizzesTargeted: 3,
    }),
  )

  // One roadmap per user — regenerating replaces the previous one.
  await prisma.roadmap.upsert({
    where: { userId },
    create: {
      userId,
      generatedAt: now,
      examDate,
      totalWeeks,
      examReadiness: 0,
      nodes,
      weeklyTargets,
    },
    update: {
      generatedAt: now,
      examDate,
      totalWeeks,
      examReadiness: 0,
      nodes,
      weeklyTargets,
    },
  })
}
