import { z } from 'zod'

export const StartSessionSchema = z.object({
  subjectSlug: z.string(),
  topicSlug: z.string(),
})

export const EndSessionSchema = z.object({
  sessionId: z.string(),
  durationSec: z.number().int().min(0),
  notesMarkdown: z.string().max(50000).optional(),
})

export type StartSessionInput = z.infer<typeof StartSessionSchema>
export type EndSessionInput = z.infer<typeof EndSessionSchema>
