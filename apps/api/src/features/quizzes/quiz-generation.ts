import { Type } from '@google/genai'
import { getGemini, QUIZ_MODEL } from '../../lib/gemini'
import { logger } from '../../config/logger'
import { AppError } from '../../middleware/error-handler'
import type { OptionId, QuizQuestion } from '../../models/types'

export type { QuizQuestion }

const OPTION_IDS: OptionId[] = ['A', 'B', 'C', 'D']

/** `Quiz.generatedByModel` for quizzes served entirely from the past-question bank. */
export const PAST_QUESTION_BANK = 'past-question-bank'

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
  locale?: string
}): Promise<QuizQuestion[]> {
  const avoidList = params.recentStems?.length
    ? `\n\nDo not repeat, and do not lightly reword, any of these recently-seen stems:\n${params.recentStems
        .slice(0, 10)
        .map((s) => `- ${s}`)
        .join('\n')}`
    : ''

  const exam = params.examType.toUpperCase()
  const targetLang =
    params.locale === 'yo' ? 'Yoruba' : params.locale === 'ha' ? 'Hausa' : params.locale === 'ig' ? 'Igbo' : null
  const langDirective = targetLang
    ? `\n- Language: All question stems, multiple-choice options, and explanations MUST be written in natural, fluent ${targetLang}. Technical subject terms, units, and mathematical equations may remain in standard form.`
    : ''

  const prompt = `Generate ${params.count} multiple-choice questions on the topic "${params.topicName}" within the subject "${params.subjectName}" for a Nigerian ${exam} candidate. Difficulty: ${params.difficulty}.

Questions must:
- Follow the exact style, phrasing and structure of ${exam} past papers
- Have exactly 4 options (A, B, C, D) with exactly one correct answer
- Use the Nigerian curriculum and Nigerian contexts for worked examples
- Include a clear, teaching explanation that explains WHY the answer is correct and references the relevant principle${langDirective}${avoidList}`

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

export async function translateQuizQuestions(
  questions: QuizQuestion[],
  locale: string,
): Promise<QuizQuestion[]> {
  if (!locale || locale === 'en' || questions.length === 0) return questions

  const targetLang =
    locale === 'yo' ? 'Yoruba' : locale === 'ha' ? 'Hausa' : locale === 'ig' ? 'Igbo' : null
  if (!targetLang) return questions

  const prompt = `You are an expert Nigerian educational translator.
Translate the stems, options, and explanations of these multiple choice quiz questions into ${targetLang}.
Rules:
- Preserve the exact question id, correctOptionId, topicSlug, difficulty, source, and imageUrl.
- Translate only "stem", "explanation", and the "text" property of each option.
- Ensure options array retains the exact same "id" (A, B, C, D) and order.
- Keep technical terms and mathematical formulas intact.
- Return a JSON array of the questions with translated text.

Questions to translate:
${JSON.stringify(questions)}`

  try {
    const ai = getGemini()
    const response = await ai.models.generateContent({
      model: QUIZ_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const text = response.text
    if (!text) return questions

    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed) || parsed.length !== questions.length) {
      return questions
    }

    return parsed.map((item, idx) => {
      const orig = questions[idx]!
      return {
        ...orig,
        stem: typeof item.stem === 'string' ? item.stem : orig.stem,
        explanation: typeof item.explanation === 'string' ? item.explanation : orig.explanation,
        options:
          Array.isArray(item.options) && item.options.length === 4
            ? item.options.map((opt: any, oIdx: number) => ({
                id: orig.options[oIdx]?.id || opt.id,
                text: typeof opt.text === 'string' ? opt.text : orig.options[oIdx]?.text || '',
              }))
            : orig.options,
      }
    })
  } catch (err) {
    logger.warn({ err, locale }, 'Failed to translate quiz questions, falling back to original')
    return questions
  }
}

