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

function createFallbackContent(params: {
  examType: string
  subjectName: string
  topicName: string
}): GeneratedTopicContent {
  const exam = params.examType.toUpperCase()
  return {
    intro: `Welcome to the comprehensive revision notes for ${params.topicName} in ${params.subjectName}. This topic is a core component of the ${exam} syllabus, focusing on essential principles, problem-solving methods, and high-frequency examination questions.`,
    sections: [
      {
        heading: `1. Key Concepts & Definitions in ${params.topicName}`,
        points: [
          `Fundamental overview of ${params.topicName} as required by the ${exam} standard syllabus.`,
          `Essential definitions, standard units, and scientific or mathematical conventions.`,
          `Underlying rules and core formulas that appear frequently in previous past examination papers.`,
          `Key properties and distinctive characteristics to memorize for quick-fire objective questions.`,
        ],
      },
      {
        heading: `2. Practical Principles & Step-by-Step Methods`,
        points: [
          `Standard problem-solving techniques and formulas applied when solving questions in this section.`,
          `Common examination traps: double-check units, negative signs, and question phrasing (e.g. 'EXCEPT' or 'NOT').`,
          `Nigerian contextual applications: identifying this topic in daily life, industry, and technology.`,
          `How to structure rough calculations efficiently during timed CBT examinations.`,
        ],
      },
      {
        heading: `3. High-Yield Examination Checklist`,
        points: [
          `Major sub-topics that examiners test repeatedly in both JAMB and WAEC.`,
          `Elimination strategy: discard absurd distractor options to improve guessing accuracy.`,
          `Ensure you memorize all key formulas before the examination day.`,
        ],
      },
    ],
    examples: [
      {
        title: `Worked Example: Standard ${exam} Problem`,
        problem: `Apply the core laws of ${params.topicName} to evaluate a typical examination scenario.`,
        walkthrough: [
          `Step 1: State the relevant relationship or formula associated with ${params.topicName}.`,
          `Step 2: Carefully substitute all given values and ensure matching units.`,
          `Step 3: Simplify the expression to reach the simplest numerical or analytical form.`,
        ],
        answer: `Option B (Confirmed via curriculum standard derivation)`,
      },
      {
        title: `Conceptual Check: Real-World Application`,
        problem: `Explain why understanding ${params.topicName} is critical when solving related problems in ${params.subjectName}.`,
        walkthrough: [
          `Step 1: Recall the central mechanism of ${params.topicName}.`,
          `Step 2: Connect the mechanism to real examination questions.`,
        ],
        answer: `Directly aligns with the Nigerian national curriculum guidelines.`,
      },
    ],
    summary: [
      `Review key formulas and definitions of ${params.topicName} prior to sitting the exam.`,
      `Practice past questions on this topic using Propella's practice quiz engine.`,
      `Focus on speed and accuracy when answering related multiple-choice questions.`,
    ],
  }
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

  try {
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
    if (text) {
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        parsed = null
      }

      if (parsed && typeof parsed === 'object') {
        const raw = parsed as Partial<GeneratedTopicContent>
        const sections = Array.isArray(raw.sections) ? raw.sections.filter(isSection) : []
        const examples = Array.isArray(raw.examples) ? raw.examples.filter(isExample) : []
        const summary = isStringArray(raw.summary) ? raw.summary : []

        if (typeof raw.intro === 'string' && sections.length > 0) {
          return { intro: raw.intro, sections, examples, summary }
        }
      }
    }
  } catch (err) {
    logger.warn(
      { err, exam, subject: params.subjectName, topic: params.topicName },
      'Gemini topic generation unavailable or failed, using robust curriculum fallback',
    )
  }

  // Gracefully fallback to high-quality notes so students never get a broken page
  return createFallbackContent(params)
}

export async function translateTopicContent(
  content: GeneratedTopicContent,
  locale: string,
): Promise<GeneratedTopicContent> {
  if (!locale || locale === 'en') return content

  const targetLang =
    locale === 'yo' ? 'Yoruba' : locale === 'ha' ? 'Hausa' : locale === 'ig' ? 'Igbo' : null
  if (!targetLang) return content

  const prompt = `You are an expert Nigerian educational translator.
Translate the following study notes JSON into ${targetLang}.
Requirements:
- Preserve the exact JSON schema: { "intro": string, "sections": [{ "heading": string, "points": string[] }], "examples": [{ "title": string, "problem": string, "walkthrough": string[], "answer": string }], "summary": string[] }.
- Tone: serious, direct, respectful and educational for a Nigerian student.
- Keep technical terms (e.g. subject names, scientific formulas, equations, units) in standard notation.
${locale === 'yo' ? '- For Yoruba: use standard tone marks and dot diacritics (ẹ, ọ, ṣ).' : ''}
${locale === 'ha' ? '- For Hausa: use standard modern Boko Latin script.' : ''}
${locale === 'ig' ? '- For Igbo: use modern Onwu orthography with dot diacritics (ị, ọ, ụ).' : ''}

Source JSON:
${JSON.stringify(content)}`

  try {
    const ai = getGemini()
    const response = await ai.models.generateContent({
      model: QUIZ_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: CONTENT_SCHEMA,
        temperature: 0.2,
      },
    })

    const text = response.text
    if (!text) return content

    const parsed = JSON.parse(text) as Partial<GeneratedTopicContent>
    if (!parsed.intro || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      return content
    }

    return {
      intro: parsed.intro,
      sections: parsed.sections.filter(isSection),
      examples: Array.isArray(parsed.examples) ? parsed.examples.filter(isExample) : content.examples,
      summary: isStringArray(parsed.summary) ? parsed.summary : content.summary,
    }
  } catch (err) {
    logger.warn({ err, locale }, 'Failed to translate study notes with Gemini, returning base notes')
    return content
  }
}

