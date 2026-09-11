import { Router, type IRouter } from 'express'
import * as quizzesController from './quizzes.controller'
import {
  aiGenerationBurstLimiter,
  aiGenerationDailyLimiter,
} from '../../middleware/rate-limit'

const router: IRouter = Router()

// Generate a new quiz. Rate limited per user: this calls the model, so it is
// the expensive route here. Taking an existing quiz is free and uncapped.
router.post(
  '/generate',
  aiGenerationBurstLimiter,
  aiGenerationDailyLimiter,
  quizzesController.generateQuiz,
)

// Start a quiz attempt
router.post('/:id/attempt', quizzesController.startAttempt)

// Submit answers for an attempt
router.post('/attempts/:attemptId/submit', quizzesController.submitAttempt)

// Get a specific attempt (for results display)
router.get('/attempts/:attemptId', quizzesController.getAttempt)

// List recent quizzes
router.get('/', quizzesController.listQuizzes)

export default router
