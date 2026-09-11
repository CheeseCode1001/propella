/**
 * Pre-generates the lesson for every syllabus topic and caches it.
 *
 * Topic lessons are generated on first view and shared by every student, so
 * without this the first person to open a topic waits ~20 seconds for it. This
 * warms the cache ahead of time so they never do.
 *
 * Designed to be interrupted. Every lesson is written as soon as it is
 * generated and already-cached topics are skipped, so re-running picks up
 * exactly where it stopped — which matters, because a full run on a free-tier
 * key takes hours and will hit rate limits along the way.
 *
 * Usage:
 *   pnpm --filter @propella/api warm:topics
 *   pnpm --filter @propella/api warm:topics -- --subject mathematics
 *   pnpm --filter @propella/api warm:topics -- --limit 20
 *   pnpm --filter @propella/api warm:topics -- --dry-run
 */
import { prisma, connectDB, disconnectDB } from '../src/config/db'
import { subjects } from '../src/seeds/syllabus'
import { generateTopicContent } from '../src/features/topics/topic-content'
import { env } from '../src/config/env'

interface Job {
  exam: string
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
}

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : undefined
  }
  return {
    subject: get('--subject'),
    limit: Number(get('--limit') ?? '0') || 0,
    dryRun: args.includes('--dry-run'),
    // Seconds between calls. The free tier allows roughly 10 requests a
    // minute and answers 503 — not 429 — once you exceed it, so the default
    // paces well under that. A paid key can safely use --delay 1.
    delay: Number(get('--delay') ?? '9') || 9,
  }
}

/**
 * One lesson per (exam, subject, topic), matching the cache key.
 *
 * A topic examined by all three boards is generated once for the first board
 * that claims it — the syllabus content is the same, and three near-identical
 * copies would triple the cost for no benefit.
 */
function buildJobs(subjectFilter?: string): Job[] {
  const jobs: Job[] = []

  for (const subject of subjects) {
    if (subjectFilter && subject.slug !== subjectFilter) continue

    for (const topic of subject.topics) {
      const exam = topic.examTypes[0] ?? subject.examTypes[0]
      if (!exam) continue

      jobs.push({
        exam,
        subjectSlug: subject.slug,
        subjectName: subject.name,
        topicSlug: topic.slug,
        topicName: topic.name,
      })
    }
  }

  return jobs
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const { subject, limit, dryRun, delay } = parseArgs()

  if (!env.GEMINI_API_KEY && !dryRun) {
    console.error('GEMINI_API_KEY is not set — nothing can be generated.')
    process.exit(1)
  }

  await connectDB()

  const all = buildJobs(subject)

  // Ask the database once rather than per topic.
  const cached = await prisma.topicContent.findMany({
    select: { exam: true, subjectSlug: true, topicSlug: true },
  })
  const have = new Set(cached.map((c) => `${c.exam}:${c.subjectSlug}:${c.topicSlug}`))

  let pending = all.filter(
    (j) => !have.has(`${j.exam}:${j.subjectSlug}:${j.topicSlug}`),
  )
  if (limit > 0) pending = pending.slice(0, limit)

  console.log(`Topics in syllabus : ${all.length}`)
  const alreadyCached = all.filter((j) => have.has(`${j.exam}:${j.subjectSlug}:${j.topicSlug}`)).length
  console.log(`Already cached     : ${alreadyCached}`)
  console.log(`To generate now    : ${pending.length}`)
  if (subject) console.log(`Subject filter     : ${subject}`)

  if (dryRun) {
    pending.slice(0, 20).forEach((j) => console.log(`  ${j.subjectSlug}/${j.topicSlug} (${j.exam})`))
    if (pending.length > 20) console.log(`  … and ${pending.length - 20} more`)
    await disconnectDB()
    return
  }

  let done = 0
  let failed = 0

  for (const [index, job] of pending.entries()) {
    const label = `${job.subjectSlug}/${job.topicSlug}`
    process.stdout.write(`[${index + 1}/${pending.length}] ${label} … `)

    try {
      const content = await generateTopicContent({
        examType: job.exam,
        subjectName: job.subjectName,
        topicName: job.topicName,
      })

      await prisma.topicContent.upsert({
        where: {
          exam_subjectSlug_topicSlug: {
            exam: job.exam as never,
            subjectSlug: job.subjectSlug,
            topicSlug: job.topicSlug,
          },
        },
        create: {
          exam: job.exam as never,
          subjectSlug: job.subjectSlug,
          topicSlug: job.topicSlug,
          topicName: job.topicName,
          subjectName: job.subjectName,
          intro: content.intro,
          sections: content.sections,
          examples: content.examples,
          summary: content.summary,
        },
        update: {
          intro: content.intro,
          sections: content.sections,
          examples: content.examples,
          summary: content.summary,
        },
      })

      done++
      console.log(
        `ok (${content.sections.length} sections, ${content.examples.length} examples)`,
      )
    } catch (err) {
      failed++
      const message = err instanceof Error ? err.message : String(err)
      console.log(`failed — ${message}`)

      // Out of quota means every remaining topic will fail the same way, so
      // stop rather than spending an hour proving it. Everything generated so
      // far is already saved; re-run once the quota resets.
      if (message.includes('temporarily unavailable')) {
        console.log(
          '\nThe API key is out of quota. Stopping here — nothing further can be generated today.',
        )
        break
      }
    }

    // Pace the calls. Skipped after the last one so the script does not sit
    // idle before exiting.
    if (index < pending.length - 1) await sleep(delay * 1000)
  }

  console.log(`\nGenerated ${done}, failed ${failed}.`)
  if (failed > 0) {
    console.log('Re-run the command to retry the ones that failed — cached topics are skipped.')
  }

  await disconnectDB()
}

main().catch(async (err) => {
  console.error(err)
  await disconnectDB().catch(() => undefined)
  process.exit(1)
})
