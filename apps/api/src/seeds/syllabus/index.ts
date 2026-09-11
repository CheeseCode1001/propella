import type { SubjectSeedData } from './types'
import { english } from './english'
import { mathematics } from './mathematics'
import { physics } from './physics'
import { chemistry } from './chemistry'
import { biology } from './biology'
import { economics } from './economics'
import { government } from './government'
import { literature } from './literature'
import { geography } from './geography'
import { commerce } from './commerce'
import { agriculturalScience } from './agricultural-science'

export type { SubjectSeedData, TopicSeedData, ExamTag } from './types'

/**
 * The syllabus, one module per subject.
 *
 * Each module lists topics in real teaching order with genuine prerequisites,
 * which is what the roadmap generator turns into a study plan — so editing a
 * subject here changes the plan every student gets on their next roadmap.
 *
 * English and Mathematics come first because every UTME candidate sits them.
 */
export const subjects: SubjectSeedData[] = [
  english,
  mathematics,
  physics,
  chemistry,
  biology,
  economics,
  government,
  literature,
  geography,
  commerce,
  agriculturalScience,
]

/** Guards against a typo creating an unreachable topic. */
export function validateSyllabus(): string[] {
  const problems: string[] = []

  for (const subject of subjects) {
    const slugs = new Set(subject.topics.map((t) => t.slug))

    const duplicates = subject.topics
      .map((t) => t.slug)
      .filter((slug, i, all) => all.indexOf(slug) !== i)
    for (const slug of new Set(duplicates)) {
      problems.push(`${subject.slug}: duplicate topic slug "${slug}"`)
    }

    for (const topic of subject.topics) {
      for (const prerequisite of topic.prerequisiteSlugs) {
        if (!slugs.has(prerequisite)) {
          problems.push(
            `${subject.slug}/${topic.slug}: prerequisite "${prerequisite}" is not a topic in this subject`,
          )
        }
      }

      // A prerequisite taught later than the topic that needs it would lock the
      // student out of their own plan.
      const prerequisiteOrders = topic.prerequisiteSlugs
        .map((slug) => subject.topics.find((t) => t.slug === slug)?.order ?? 0)
        .filter((order) => order >= topic.order)
      if (prerequisiteOrders.length > 0) {
        problems.push(
          `${subject.slug}/${topic.slug}: has a prerequisite that comes later in the order`,
        )
      }
    }
  }

  return problems
}
