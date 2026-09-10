import { prisma } from '../../config/db'
import { NotFoundError } from '../../middleware/error-handler'
import { jsonArray, type SubjectTopic, type TopicSection, type TopicExample } from '../../models/types'
import { generateTopicContent } from './topic-content'
import { logger } from '../../config/logger'

export interface TopicNeighbour {
  subjectSlug: string
  topicSlug: string
  topicName: string
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
}

/**
 * Returns the lesson for one topic, generating and caching it on first request.
 *
 * The row is shared by every student sitting the same exam, so the model is
 * called once per topic rather than once per reader.
 */
export async function getTopicReader(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
): Promise<TopicReaderResponse> {
  const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } })
  if (!subject) throw new NotFoundError('Subject not found')

  const topics = jsonArray<SubjectTopic>(subject.topics)
  const index = topics.findIndex((t) => t.slug === topicSlug)
  if (index === -1) throw new NotFoundError('Topic not found')

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

  const toNeighbour = (t: SubjectTopic | undefined): TopicNeighbour | null =>
    t ? { subjectSlug, topicSlug: t.slug, topicName: t.name } : null

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
  }
}
