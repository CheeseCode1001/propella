import rateLimit from 'express-rate-limit'
import type { Request } from 'express'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
})

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many signup attempts, please try again after an hour' },
})

/* -------------------------------------------------------------------------- */
/* AI limits                                                                   */
/*                                                                            */
/* Keyed by user id, not IP: students share connections — a school computer    */
/* room or a tethered phone would otherwise throttle a whole class at once.    */
/* The IP fallback only applies to unauthenticated requests, which these       */
/* routes do not serve.                                                       */
/*                                                                            */
/* Every AI call costs real money, so each tier has both a burst limit (stops  */
/* a runaway loop) and a sustained limit (caps the daily bill per account).    */
/* -------------------------------------------------------------------------- */

function byUser(req: Request): string {
  return req.user?.id ?? req.ip ?? 'unknown'
}

/** Shared shape so the tiers below stay consistent. */
function aiLimit(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: byUser,
    // A blocked request never reached the model, so it should not count
    // towards the next window as if it had.
    skipFailedRequests: false,
    message: { error: message },
  })
}

/**
 * Assistant chat. Conversational and bursty — a student firing off several
 * follow-ups in a row is normal use, not abuse.
 */
export const aiChatBurstLimiter = aiLimit(
  60 * 1000,
  15,
  'You are sending messages very quickly. Please wait a moment and try again.',
)

export const aiChatDailyLimiter = aiLimit(
  24 * 60 * 60 * 1000,
  200,
  'You have reached today\'s limit for the AI assistant. It resets in 24 hours.',
)

/**
 * Generating a quiz, a mock paper or a topic lesson. Far more expensive per
 * call than a chat message, and nobody legitimately needs many per minute.
 */
export const aiGenerationBurstLimiter = aiLimit(
  60 * 1000,
  5,
  'That is a lot of requests at once. Please wait a minute and try again.',
)

export const aiGenerationDailyLimiter = aiLimit(
  24 * 60 * 60 * 1000,
  60,
  'You have reached today\'s limit for generating new material. It resets in 24 hours.',
)
