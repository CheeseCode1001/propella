import fs from 'fs'
import path from 'path'
import { prisma } from '../config/db'
import { parsePastQuestions, type ParsedPastQuestion } from '../lib/past-question-import'
import { subjects } from './syllabus'

/**
 * Loads the reviewed past-question bank from data/past-questions/*.json - the
 * same JSON the admin importer accepts, converted from the JAMB PDFs by
 * scripts/past-questions.
 *
 * Safe to re-run. Seeded rows are matched on subject + source ("JAMB UTME
 * 2014 Q12") rather than the fingerprint, because the fingerprint includes the
 * stem: fixing a typo in the data would otherwise add a second copy instead
 * of correcting the first.
 *
 * The data file is the source of truth for its subject's "JAMB UTME <year>
 * Q<n>" rows, so a question dropped in review is removed from the bank too.
 * Quizzes keep their own copy of each question, so old attempts are unaffected.
 */

export const PAST_QUESTIONS_DIR = path.resolve(__dirname, '../../data/past-questions')

/** The source format scripts/past-questions writes; other sources are admin uploads. */
export const SEEDED_SOURCE = /^JAMB UTME \d{4} Q\d+$/

export function pastQuestionFiles(dir = PAST_QUESTIONS_DIR): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => path.join(dir, f))
}

/** Parses one data file and checks every subject and topic against the syllabus. */
export function loadPastQuestionFile(file: string): ParsedPastQuestion[] {
  const { questions, errors } = parsePastQuestions(fs.readFileSync(file, 'utf8'), 'json')
  const problems = errors.map((e) => `row ${e.row}: ${e.reason}`)

  for (const q of questions) {
    const subject = subjects.find((s) => s.slug === q.subjectSlug)
    if (!subject) {
      problems.push(`${q.source}: unknown subject "${q.subjectSlug}"`)
    } else if (q.topicSlug && !subject.topics.some((t) => t.slug === q.topicSlug)) {
      problems.push(`${q.source}: unknown topic "${q.topicSlug}" in ${q.subjectSlug}`)
    }
    if (!q.source) problems.push(`row with stem "${q.stem.slice(0, 40)}" has no source`)
  }

  if (problems.length > 0) {
    throw new Error(`${path.basename(file)} is not valid:\n  - ${problems.join('\n  - ')}`)
  }
  return questions
}

export interface SeedSummary {
  file: string
  total: number
  created: number
  updated: number
  unchanged: number
  removed: number
}

function sameContent(
  row: {
    stem: string
    options: unknown
    correctOptionId: string
    topicSlug: string | null
    year: number
    exam: string
    explanation: string | null
    imageUrl: string | null
  },
  q: ParsedPastQuestion,
): boolean {
  return (
    row.stem === q.stem &&
    JSON.stringify(row.options) === JSON.stringify(q.options) &&
    row.correctOptionId === q.correctOptionId &&
    row.topicSlug === q.topicSlug &&
    row.year === q.year &&
    row.exam === q.exam &&
    row.explanation === q.explanation &&
    row.imageUrl === q.imageUrl
  )
}

export async function seedPastQuestionFile(file: string): Promise<SeedSummary> {
  const questions = loadPastQuestionFile(file)
  const summary: SeedSummary = {
    file: path.basename(file),
    total: questions.length,
    created: 0,
    updated: 0,
    unchanged: 0,
    removed: 0,
  }
  if (questions.length === 0) return summary

  const subjectSlugs = [...new Set(questions.map((q) => q.subjectSlug))]
  const existing = await prisma.pastQuestion.findMany({
    where: { subjectSlug: { in: subjectSlugs }, source: { startsWith: 'JAMB UTME ' } },
  })
  const bySource = new Map(existing.map((r) => [`${r.subjectSlug}|${r.source}`, r]))

  const inFile = new Set(questions.map((q) => `${q.subjectSlug}|${q.source}`))
  const retired = existing.filter(
    (r) => r.source && SEEDED_SOURCE.test(r.source) && !inFile.has(`${r.subjectSlug}|${r.source}`),
  )
  if (retired.length > 0) {
    const result = await prisma.pastQuestion.deleteMany({
      where: { id: { in: retired.map((r) => r.id) } },
    })
    summary.removed = result.count
  }

  const toCreate: ParsedPastQuestion[] = []
  for (const q of questions) {
    const row = bySource.get(`${q.subjectSlug}|${q.source}`)
    if (!row) {
      toCreate.push(q)
    } else if (sameContent(row, q)) {
      summary.unchanged += 1
    } else {
      await prisma.pastQuestion.update({
        where: { id: row.id },
        data: {
          exam: q.exam,
          year: q.year,
          topicSlug: q.topicSlug,
          stem: q.stem,
          options: q.options,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
          imageUrl: q.imageUrl,
          fingerprint: q.fingerprint,
        },
      })
      summary.updated += 1
    }
  }

  for (let i = 0; i < toCreate.length; i += 500) {
    const result = await prisma.pastQuestion.createMany({
      data: toCreate.slice(i, i + 500).map((q) => ({
        exam: q.exam,
        year: q.year,
        subjectSlug: q.subjectSlug,
        topicSlug: q.topicSlug,
        stem: q.stem,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
        source: q.source,
        imageUrl: q.imageUrl,
        fingerprint: q.fingerprint,
      })),
      // An admin may already have uploaded the identical question.
      skipDuplicates: true,
    })
    summary.created += result.count
    summary.unchanged += Math.min(500, toCreate.length - i) - result.count
  }

  return summary
}

export async function seedPastQuestions(): Promise<SeedSummary[]> {
  const summaries: SeedSummary[] = []
  for (const file of pastQuestionFiles()) {
    const summary = await seedPastQuestionFile(file)
    summaries.push(summary)
    console.log(
      `Past questions ${summary.file}: ${summary.total} in file, ${summary.created} added, ` +
        `${summary.updated} updated, ${summary.removed} removed, ${summary.unchanged} already current.`,
    )
  }
  return summaries
}
