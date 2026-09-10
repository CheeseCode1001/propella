import { Type } from '@google/genai'
import { getGemini, QUIZ_MODEL } from '../../lib/gemini'
import { logger } from '../../config/logger'
import { AppError } from '../../middleware/error-handler'
import type { OptionId, QuizQuestion } from '../../models/types'

export type { QuizQuestion }

const OPTION_IDS: OptionId[] = ['A', 'B', 'C', 'D']

/**
 * Gemini honours a response schema natively, so the model returns parseable
 * JSON instead of prose we have to fish an array out of.
 */
const QUESTION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      stem: {
        type: Type.STRING,
        description: 'The question text, in the style of a past paper.',
      },
      options: {
        type: Type.ARRAY,
        minItems: '4',
        maxItems: '4',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, enum: OPTION_IDS },
            text: { type: Type.STRING },
          },
          required: ['id', 'text'],
          propertyOrdering: ['id', 'text'],
        },
      },
      correctOptionId: { type: Type.STRING, enum: OPTION_IDS },
      explanation: {
        type: Type.STRING,
        description:
          'Explains why the answer is correct and names the principle involved.',
      },
    },
    required: ['stem', 'options', 'correctOptionId', 'explanation'],
    propertyOrdering: ['stem', 'options', 'correctOptionId', 'explanation'],
  },
}

interface RawQuestion {
  stem?: unknown
  options?: unknown
  correctOptionId?: unknown
  explanation?: unknown
}

function isValidOption(value: unknown): value is { id: OptionId; text: string } {
  if (!value || typeof value !== 'object') return false
  const option = value as { id?: unknown; text?: unknown }
  return (
    typeof option.text === 'string' &&
    typeof option.id === 'string' &&
    (OPTION_IDS as string[]).includes(option.id)
  )
}

export async function generateQuestions(params: {
  examType: string
  subjectName: string
  topicName: string
  topicSlug: string
  difficulty: string
  count: number
  recentStems?: string[]
}): Promise<QuizQuestion[]> {
  const avoidList = params.recentStems?.length
    ? `\n\nDo not repeat, and do not lightly reword, any of these recently-seen stems:\n${params.recentStems
        .slice(0, 10)
        .map((s) => `- ${s}`)
        .join('\n')}`
    : ''

  const exam = params.examType.toUpperCase()

  const prompt = `Generate ${params.count} multiple-choice questions on the topic "${params.topicName}" within the subject "${params.subjectName}" for a Nigerian ${exam} candidate. Difficulty: ${params.difficulty}.

Questions must:
- Follow the exact style, phrasing and structure of ${exam} past papers
- Have exactly 4 options (A, B, C, D) with exactly one correct answer
- Use the Nigerian curriculum and Nigerian contexts for worked examples
- Include a clear, teaching explanation that explains WHY the answer is correct and references the relevant principle${avoidList}`

  const ai = getGemini()

  const response = await ai.models.generateContent({
    model: QUIZ_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: QUESTION_SCHEMA,
      temperature: 0.9,
    },
  })

  const text = response.text
  if (!text) {
    logger.error({ model: QUIZ_MODEL }, 'Empty response from Gemini')
    throw new AppError(502, 'The AI returned an empty response — please retry')
  }

  let raw: RawQuestion[]
  try {
    const parsed: unknown = JSON.parse(text)
    if (!Array.isArray(parsed)) throw new Error('Response was not a JSON array')
    raw = parsed as RawQuestion[]
  } catch (err) {
    logger.error({ err, text: text.slice(0, 500) }, 'Could not parse Gemini response')
    throw new AppError(502, 'The AI returned malformed questions — please retry')
  }

  const questions: QuizQuestion[] = []

  for (const [i, q] of raw.entries()) {
    // Drop anything malformed rather than persisting an unanswerable question.
    if (
      typeof q.stem !== 'string' ||
      typeof q.explanation !== 'string' ||
      typeof q.correctOptionId !== 'string' ||
      !(OPTION_IDS as string[]).includes(q.correctOptionId) ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.options.every(isValidOption)
    ) {
      logger.warn({ index: i, topicSlug: params.topicSlug }, 'Discarded malformed question')
      continue
    }

    questions.push({
      id: `q${Date.now().toString(36)}_${i}`,
      stem: q.stem,
      options: q.options,
      correctOptionId: q.correctOptionId as OptionId,
      explanation: q.explanation,
      topicSlug: params.topicSlug,
      difficulty: params.difficulty as 'easy' | 'medium' | 'hard',
    })
  }

  if (questions.length === 0) {
    throw new AppError(502, 'The AI returned no usable questions — please retry')
  }

  return questions
}
