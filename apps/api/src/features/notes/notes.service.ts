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
