import { GoogleGenAI } from '@google/genai'
import { env } from '../config/env'
import { AppError } from '../middleware/error-handler'

let client: GoogleGenAI | null = null

/**
 * Lazily constructs the Gemini client so the API still boots without a key —
 * only the AI-backed routes fail, and they fail with a clear 503.
 */
export function getGemini(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(
      503,
      'AI features are unavailable — set GEMINI_API_KEY in apps/api/.env',
    )
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  }
  return client
}

/** Higher-quality model — quiz and mock-exam question generation. */
export const QUIZ_MODEL = env.GEMINI_QUIZ_MODEL

/** Faster, cheaper model — streaming assistant chat. */
export const CHAT_MODEL = env.GEMINI_CHAT_MODEL
