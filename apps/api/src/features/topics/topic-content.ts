import { Type } from '@google/genai'
import { getGemini, QUIZ_MODEL } from '../../lib/gemini'
import { AppError } from '../../middleware/error-handler'
import { logger } from '../../config/logger'
import type { TopicSection, TopicExample } from '../../models/types'

export interface GeneratedTopicContent {
  intro: string
  sections: TopicSection[]
  examples: TopicExample[]
  summary: string[]
}

/**
 * The shape the model must return.
 *
 * Bullet points, worked examples and a revision summary are requested
 * explicitly — a student reading before an exam needs scannable structure,
 * not an essay.
 */
const CONTENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    intro: {
      type: Type.STRING,
      description: 'One short paragraph saying what this topic is and why it matters.',
    },
    sections: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 6,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          points: {
            type: Type.ARRAY,
            minItems: 3,
            maxItems: 7,
            items: { type: Type.STRING },
          },
        },
        required: ['heading', 'points'],
      },
    },
    examples: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 3,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          problem: { type: Type.STRING },
          walkthrough: {
            type: Type.ARRAY,
            minItems: 2,
            maxItems: 6,
            items: { type: Type.STRING },
          },
          answer: { type: Type.STRING },
        },
        required: ['title', 'problem', 'walkthrough', 'answer'],
      },
    },
    summary: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 6,
      items: { type: Type.STRING },
    },
  },
  required: ['intro', 'sections', 'examples', 'summary'],
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

function isSection(value: unknown): value is TopicSection {
  if (!value || typeof value !== 'object') return false
  const s = value as { heading?: unknown; points?: unknown }
  return typeof s.heading === 'string' && isStringArray(s.points)
}

function isExample(value: unknown): value is TopicExample {
  if (!value || typeof value !== 'object') return false
  const e = value as {
    title?: unknown
    problem?: unknown
    walkthrough?: unknown
    answer?: unknown
  }
  return (
    typeof e.title === 'string' &&
    typeof e.problem === 'string' &&
    typeof e.answer === 'string' &&
    isStringArray(e.walkthrough)
  )
}

/**
 * Momentary overload. Worth waiting out — the next attempt usually works.
 */
function isTransient(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('"code":503') || message.includes('UNAVAILABLE')
}

/**
 * The API key has no quota left.
 *
 * Distinct from overload on purpose: retrying cannot fix it, and reporting it
 * as "busy" sends whoever is debugging after a throughput problem that is not
 * there. On the free tier this resets daily.
 */
function isQuotaExhausted(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('RESOURCE_EXHAUSTED') || message.includes('"code":429')
}

/**
 * Retries a generation call through temporary model unavailability.
 *
 * Free-tier Gemini returns 503 under load often enough that a single attempt
 * regularly fails; three tries with backoff turns most of those into a slower
 * success rather than an error page.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (!isTransient(err) || attempt === attempts - 1) break

      const waitMs = 1500 * 2 ** attempt
      logger.warn({ attempt: attempt + 1, waitMs }, 'Gemini busy, retrying topic generation')
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }
  }

  if (isQuotaExhausted(lastError)) {
    // Says "quota" in the log so an operator knows to check billing, while the
    // student sees something that makes sense to them.
    logger.error({ err: lastError }, 'Gemini quota exhausted — topic content unavailable')
    throw new AppError(
      503,
      'Study notes are temporarily unavailable. Please try again later.',
    )
  }

  if (isTransient(lastError)) {
    throw new AppError(
      503,
      'Our study notes service is busy right now. Please try again in a moment.',
    )
  }

  logger.error({ err: lastError }, 'Topic content generation failed')
  throw new AppError(502, 'We could not prepare these notes. Please try again.')
}

export async function generateTopicContent(params: {
  examType: string
  subjectName: string
  topicName: string
}): Promise<GeneratedTopicContent> {
  const exam = params.examType.toUpperCase()

  const prompt = `Write study notes on the topic "${params.topicName}" within the subject "${params.subjectName}" for a Nigerian ${exam} candidate.

Requirements:
- Write for a 15-22 year old. Plain, everyday English. Short sentences.
- Explain before you impress: define terms the first time they appear.
- Use the Nigerian curriculum, and Nigerian contexts in examples (naira, local place names, familiar scenarios).
- Every section must be scannable bullet points, not paragraphs.
- Worked examples must show the steps, in the order a student would actually do them, ending with the final answer.
- The summary must be the points worth revising the night before the exam.
- Be encouraging and factual. Never imply the reader is behind or that the exam is frightening.`

  const ai = getGemini()

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: QUIZ_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: CONTENT_SCHEMA,
        temperature: 0.7,
      },
    }),
  )

  const text = response.text
  if (!text) {
    logger.error({ model: QUIZ_MODEL }, 'Empty topic-content response from Gemini')
    throw new AppError(502, 'The AI returned an empty response — please retry')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    logger.error({ model: QUIZ_MODEL }, 'Topic content was not valid JSON')
    throw new AppError(502, 'The AI response could not be read — please retry')
  }

  const raw = parsed as Partial<GeneratedTopicContent>

  const sections = Array.isArray(raw.sections) ? raw.sections.filter(isSection) : []
  const examples = Array.isArray(raw.examples) ? raw.examples.filter(isExample) : []
  const summary = isStringArray(raw.summary) ? raw.summary : []

  if (typeof raw.intro !== 'string' || sections.length === 0) {
    throw new AppError(502, 'The AI returned incomplete notes — please retry')
  }

  return { intro: raw.intro, sections, examples, summary }
}
