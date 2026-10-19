import type { Note } from '../../config/db'
import { prisma } from '../../config/db'
import { NotFoundError } from '../../middleware/error-handler'

export interface NoteInput {
  title?: string
  content?: string
  subjectSlug?: string | null
  topicSlug?: string | null
  pinned?: boolean
}

/** Pinned first, then most recently edited. */
export async function listNotes(userId: string, search?: string): Promise<Note[]> {
  return prisma.note.findMany({
    where: {
      userId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
  })
}

export async function getNote(userId: string, id: string): Promise<Note> {
  const note = await prisma.note.findFirst({ where: { id, userId } })
  if (!note) throw new NotFoundError('Note not found')
  return note
}

export async function createNote(userId: string, input: NoteInput): Promise<Note> {
  return prisma.note.create({
    data: {
      userId,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.subjectSlug !== undefined ? { subjectSlug: input.subjectSlug } : {}),
      ...(input.topicSlug !== undefined ? { topicSlug: input.topicSlug } : {}),
    },
  })
}

export async function updateNote(
  userId: string,
  id: string,
  input: NoteInput,
): Promise<Note> {
  // Scoped update so one student can never edit another's note.
  const existing = await prisma.note.findFirst({
    where: { id, userId },
    select: { id: true },
  })
  if (!existing) throw new NotFoundError('Note not found')

  return prisma.note.update({
    where: { id: existing.id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.subjectSlug !== undefined ? { subjectSlug: input.subjectSlug } : {}),
      ...(input.topicSlug !== undefined ? { topicSlug: input.topicSlug } : {}),
      ...(input.pinned !== undefined ? { pinned: input.pinned } : {}),
    },
  })
}

export async function deleteNote(userId: string, id: string): Promise<void> {
  const result = await prisma.note.deleteMany({ where: { id, userId } })
  if (result.count === 0) throw new NotFoundError('Note not found')
}

/**
 * The note attached to a topic, if the student has already started one.
 * Used by the topic reader so writing continues where it left off.
 */
export async function getTopicNote(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
): Promise<Note | null> {
  return prisma.note.findFirst({
    where: { userId, subjectSlug, topicSlug },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function summarizeMaterial(content: string): Promise<{
  summary: string
  keyPoints: string[]
  examTips: string[]
}> {
  const text = content?.trim()
  if (!text) throw new NotFoundError('Content is required to generate a summary')

  const { getGemini, QUIZ_MODEL } = await import('../../lib/gemini')
  const ai = getGemini()

  const prompt = `You are a high-level educational AI tutor.
Analyze the following study notes / reading material and generate:
1. A concise, clear Executive Summary (2-3 paragraphs)
2. 5-7 bullet points of crucial Key Concepts & Definitions
3. 3-4 High-Yield Exam Tips / Traps to avoid

Text:
"""
${text.slice(0, 15000)}
"""

Return valid JSON with keys:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "examTips": ["...", "..."]
}`

  const response = await ai.models.generateContent({
    model: QUIZ_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.5,
    },
  })

  try {
    const parsed = JSON.parse(response.text || '{}')
    return {
      summary: parsed.summary || 'Summary generated from material.',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      examTips: Array.isArray(parsed.examTips) ? parsed.examTips : [],
    }
  } catch {
    return {
      summary: response.text || 'Summary generated successfully.',
      keyPoints: [],
      examTips: [],
    }
  }
}

export async function generateRevisionAids(content: string): Promise<{
  flashcards: Array<{ front: string; back: string }>
  keyQuestions: Array<{ question: string; answer: string }>
}> {
  const text = content?.trim()
  if (!text) throw new NotFoundError('Content is required to generate revision aids')

  const { getGemini, QUIZ_MODEL } = await import('../../lib/gemini')
  const ai = getGemini()

  const prompt = `You are an expert revision tutor for secondary and tertiary students.
Based on the following reading material, generate:
1. 6-8 Revision Flashcards (front question/term, back answer/definition)
2. 4-5 High-Yield Self-Test Questions with detailed answers

Text:
"""
${text.slice(0, 15000)}
"""

Return valid JSON with keys:
{
  "flashcards": [
    { "front": "...", "back": "..." }
  ],
  "keyQuestions": [
    { "question": "...", "answer": "..." }
  ]
}`

  const response = await ai.models.generateContent({
    model: QUIZ_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.6,
    },
  })

  try {
    const parsed = JSON.parse(response.text || '{}')
    return {
      flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
      keyQuestions: Array.isArray(parsed.keyQuestions) ? parsed.keyQuestions : [],
    }
  } catch {
    return {
      flashcards: [],
      keyQuestions: [],
    }
  }
}
