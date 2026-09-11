import { Router, type IRouter } from 'express'
import * as topicsController from './topics.controller'
import {
  aiGenerationBurstLimiter,
  aiGenerationDailyLimiter,
} from '../../middleware/rate-limit'

const router: IRouter = Router()

// A GET, but it generates the lesson on a cache miss, so it is rate limited
// like the other model calls. Cached topics are served well inside the window.
router.get(
  '/:subjectSlug/:topicSlug',
  aiGenerationBurstLimiter,
  aiGenerationDailyLimiter,
  topicsController.getTopicReader,
)

export default router
