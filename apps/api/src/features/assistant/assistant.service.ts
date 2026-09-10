import { nanoid } from 'nanoid'
import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { getGemini, CHAT_MODEL } from '../../lib/gemini'
import { jsonArray, type ChatMessage } from '../../models/types'

const SYSTEM_PROMPT = `You are Propella, a focused study companion for Nigerian secondary school students preparing for JAMB, WAEC, and NECO. Answer clearly and concisely. Use Nigerian curriculum examples where helpful. When a student asks about a topic in their syllabus, structure answers as: a 1-2 sentence definition, the core principle, a worked example, and 2 practice questions they can try. Never claim to know things you don't. Refuse off-topic requests politely (entertainment, off-curriculum subjects).`

export interface ThreadSummary {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface ThreadDetail extends ThreadSummary {
  messages: ChatMessage[]
}

export async function getThreads(userId: string): Promise<ThreadSummary[]> {
  return prisma.chatThread.findMany({
    where: { userId, archivedAt: null },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
}

export async function createThread(userId: string): Promise<ThreadSummary> {
  return prisma.chatThread.create({
    data: { userId, title: 'New conversation', messages: [] },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
}

export async function getThread(userId: string, threadId: string): Promise<ThreadDetail> {
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, userId },
  })

  if (!thread) throw new NotFoundError('Thread not found')

  return {
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    messages: jsonArray<ChatMessage>(thread.messages),
  }
}

const MAX_TITLE_LENGTH = 80

/** Renames a conversation. Ownership is enforced by the userId in the filter. */
export async function renameThread(
  userId: string,
  threadId: string,
  title: string,
): Promise<ThreadSummary> {
  const trimmed = title.trim().slice(0, MAX_TITLE_LENGTH)
  if (!trimmed) throw new AppError(400, 'A conversation needs a title')

  const existing = await prisma.chatThread.findFirst({
    where: { id: threadId, userId, archivedAt: null },
    select: { id: true },
  })
  if (!existing) throw new NotFoundError('Thread not found')

  return prisma.chatThread.update({
    where: { id: threadId },
    data: { title: trimmed },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
}

/**
 * Removes a conversation.
 *
 * Archived rather than deleted: threads carry the student's own questions, and
 * a soft delete means an accidental tap is recoverable from the database.
 * Archived threads are already filtered out of every read path.
 */
export async function deleteThread(userId: string, threadId: string): Promise<void> {
  const existing = await prisma.chatThread.findFirst({
    where: { id: threadId, userId, archivedAt: null },
    select: { id: true },
  })
  if (!existing) throw new NotFoundError('Thread not found')

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { archivedAt: new Date() },
  })
}

export async function streamMessage(
  userId: string,
  threadId: string,
  content: string,
  attachedTopic?: { subjectSlug: string; topicSlug: string },
  onChunk?: (chunk: string) => void,
): Promise<string> {
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, userId },
  })

  if (!thread) throw new NotFoundError('Thread not found')

  const messages = jsonArray<ChatMessage>(thread.messages)

  const userMessage: ChatMessage = {
    id: nanoid(),
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
    ...(attachedTopic ? { attachedTopic } : {}),
  }

  // Gemini names the assistant turn "model"; prior turns become the history and
  // the new message is appended last.
  const contents = [...messages, userMessage].map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.content }],
  }))

  const ai = getGemini()

  const stream = await ai.models.generateContentStream({
    model: CHAT_MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 2048,
    },
  })

  let fullText = ''

  for await (const chunk of stream) {
    const text = chunk.text
    if (text) {
      fullText += text
      if (onChunk) onChunk(text)
    }
  }

  const assistantMessage: ChatMessage = {
    id: nanoid(),
    role: 'assistant',
    content: fullText,
    createdAt: new Date().toISOString(),
  }

  const nextMessages = [...messages, userMessage, assistantMessage]

  await prisma.chatThread.update({
    where: { id: thread.id },
    data: {
      messages: nextMessages,
      // Title the thread from its opening question.
      ...(messages.length === 0 ? { title: content.slice(0, 60) } : {}),
    },
  })

  return fullText
}
