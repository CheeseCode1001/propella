import { prisma } from '../../config/db'
import { NotFoundError } from '../../middleware/error-handler'
import {
  jsonArray,
  type SubjectTopic,
  type TopicSection,
  type TopicExample,
  type RoadmapNodeJson,
} from '../../models/types'
import { generateTopicContent, translateTopicContent } from './topic-content'
import { logger } from '../../config/logger'
import { assertCanAccessTopic } from '../entitlements/entitlements.service'

export interface TopicNeighbour {
  subjectSlug: string
  topicSlug: string
  topicName: string
}

export interface TopicQuizResult {
  attemptId: string
  quizId: string
  score: number
  totalQuestions: number
  correctCount: number
  completedAt: string
  durationSec: number
}

export interface TopicReaderResponse {
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
  intro: string
  sections: TopicSection[]
  examples: TopicExample[]
  summary: string[]
  /** Ordered neighbours within the same subject, so the reader can move on. */
  previous: TopicNeighbour | null
  next: TopicNeighbour | null
  quizResult: TopicQuizResult | null
  isCompleted: boolean
}

const topicTranslationCache = new Map<
  string,
  { intro: string; sections: TopicSection[]; examples: TopicExample[]; summary: string[] }
>()

/**
 * Returns the lesson for one topic, generating and caching it on first request.
 * Respects student's selected locale (Yoruba, Hausa, Igbo) with translation.
 */
export async function getTopicReader(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
  locale?: string,
): Promise<TopicReaderResponse> {
  const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } })
  if (!subject) throw new NotFoundError('Subject not found')

  const topics = jsonArray<SubjectTopic>(subject.topics)
  const index = topics.findIndex((t) => t.slug === topicSlug)
  if (index === -1) throw new NotFoundError('Topic not found')

  // Check trial quota / entitlement before serving topic content
  await assertCanAccessTopic(userId, subjectSlug, topicSlug)

  // Ensure topic is at least ready/in-progress in user's roadmap so returning to syllabus never shows it locked
  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { userId },
      select: { nodes: true },
    })
    if (roadmap) {
      const nodes = jsonArray<RoadmapNodeJson>(roadmap.nodes)
      const targetNode = nodes.find(
        (n) => n.subjectSlug === subjectSlug && n.topicSlug === topicSlug,
      )
      if (targetNode && (targetNode.status === 'locked' || targetNode.status === 'ready')) {
        targetNode.status = 'in-progress'
        await prisma.roadmap.update({
          where: { userId },
          data: { nodes },
        })
      }
    }
  } catch (err) {
    logger.warn({ err, userId, subjectSlug, topicSlug }, 'Failed to sync topic reading state to roadmap')
  }

  const topic = topics[index]!

  // Which exam to pitch the notes at: the student's own, where it applies to
  // this subject, otherwise whichever the subject is examined in.
  const profile = await prisma.examProfile.findUnique({
    where: { userId },
    select: { examType: true, examTypes: true },
  })

  const studentExams = profile?.examTypes?.length
    ? profile.examTypes
    : profile?.examType
      ? [profile.examType]
      : []

  const exam =
    studentExams.find((e) => subject.examTypes.includes(e)) ??
    subject.examTypes[0] ??
    'jamb'

  const cached = await prisma.topicContent.findUnique({
    where: {
      exam_subjectSlug_topicSlug: { exam, subjectSlug, topicSlug },
    },
  })

  let intro: string
  let sections: TopicSection[]
  let examples: TopicExample[]
  let summary: string[]

  if (cached) {
    intro = cached.intro
    sections = jsonArray<TopicSection>(cached.sections)
    examples = jsonArray<TopicExample>(cached.examples)
    summary = jsonArray<string>(cached.summary)
  } else {
    const generated = await generateTopicContent({
      examType: exam,
      subjectName: subject.name,
      topicName: topic.name,
    })

    intro = generated.intro
    sections = generated.sections
    examples = generated.examples
    summary = generated.summary

    // Two students opening the same new topic at once would both generate it;
    // the unique index makes the loser's write a no-op rather than an error.
    try {
      await prisma.topicContent.create({
        data: {
          exam,
          subjectSlug,
          topicSlug,
          topicName: topic.name,
          subjectName: subject.name,
          intro,
          sections,
          examples,
          summary,
        },
      })
    } catch (err) {
      logger.warn({ err, subjectSlug, topicSlug }, 'Topic content was already cached')
    }
  }

  // If locale requested is non-English (yo, ha, ig), translate notes
  if (locale && locale !== 'en') {
    const cacheKey = `${exam}:${subjectSlug}:${topicSlug}:${locale}`
    const cachedTranslation = topicTranslationCache.get(cacheKey)
    if (cachedTranslation) {
      intro = cachedTranslation.intro
      sections = cachedTranslation.sections
      examples = cachedTranslation.examples
      summary = cachedTranslation.summary
    } else {
      const translated = await translateTopicContent(
        { intro, sections, examples, summary },
        locale,
      )
      intro = translated.intro
      sections = translated.sections
      examples = translated.examples
      summary = translated.summary
      topicTranslationCache.set(cacheKey, { intro, sections, examples, summary })
    }
  }

  const toNeighbour = (t: SubjectTopic | undefined): TopicNeighbour | null =>
    t ? { subjectSlug, topicSlug: t.slug, topicName: t.name } : null

  // Fetch latest completed quiz attempt for this topic
  const latestAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId,
      completedAt: { not: null },
      quiz: {
        OR: [
          { topicTopicSlug: topicSlug },
          { topicSubjectSlug: subjectSlug, topicTopicSlug: topicSlug },
          { subjectSlug, topicTopicSlug: topicSlug },
        ],
      },
    },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      quizId: true,
      score: true,
      completedAt: true,
      durationSec: true,
      answers: true,
      quiz: {
        select: {
          questionCount: true,
        },
      },
    },
  })

  let quizResult: TopicQuizResult | null = null
  if (latestAttempt) {
    const answers = jsonArray<{ isCorrect?: boolean }>(latestAttempt.answers)
    const correctCount = answers.filter((a) => a.isCorrect).length
    const totalQuestions = latestAttempt.quiz.questionCount || answers.length || 10
    quizResult = {
      attemptId: latestAttempt.id,
      quizId: latestAttempt.quizId,
      score: latestAttempt.score,
      totalQuestions,
      correctCount: answers.length > 0 ? correctCount : Math.round((latestAttempt.score / 100) * totalQuestions),
      completedAt: latestAttempt.completedAt?.toISOString() ?? new Date().toISOString(),
      durationSec: latestAttempt.durationSec,
    }
  }

  // Check if topic is marked completed on roadmap or via completed quiz
  let isCompleted = Boolean(latestAttempt)
  if (!isCompleted) {
    try {
      const roadmap = await prisma.roadmap.findUnique({
        where: { userId },
        select: { nodes: true },
      })
      if (roadmap) {
        const nodes = jsonArray<RoadmapNodeJson>(roadmap.nodes)
        const currentNode = nodes.find(
          (n) => n.subjectSlug === subjectSlug && n.topicSlug === topicSlug,
        )
        if (currentNode?.status === 'completed') {
          isCompleted = true
        }
      }
    } catch {
      // non-blocking
    }
  }

  return {
    subjectSlug,
    subjectName: subject.name,
    topicSlug,
    topicName: topic.name,
    intro,
    sections,
    examples,
    summary,
    previous: toNeighbour(topics[index - 1]),
    next: toNeighbour(topics[index + 1]),
    quizResult,
    isCompleted,
  }
}
