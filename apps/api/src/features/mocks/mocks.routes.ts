import { Router, type IRouter } from 'express'
import * as mocksController from './mocks.controller'
import {
  aiGenerationBurstLimiter,
  aiGenerationDailyLimiter,
} from '../../middleware/rate-limit'

const router: IRouter = Router()

// Building a mock paper is the costly call; sitting one is not.
router.post(
  '/generate',
  aiGenerationBurstLimiter,
  aiGenerationDailyLimiter,
  mocksController.generateMock,
)
router.post('/:id/attempt', mocksController.startMockAttempt)
router.post('/attempts/:attemptId/submit', mocksController.submitMock)
router.get('/attempts/:attemptId', mocksController.getMockAttemptResult)
router.get('/', mocksController.getMockHistory)

export default router
