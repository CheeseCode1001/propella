import { Router, type IRouter } from 'express'
import * as assistantController from './assistant.controller'
import { aiChatBurstLimiter, aiChatDailyLimiter } from '../../middleware/rate-limit'

const router: IRouter = Router()

router.get('/threads', assistantController.getThreads)
router.post('/threads', assistantController.createThread)
router.get('/threads/:id', assistantController.getThread)
router.patch('/threads/:id', assistantController.renameThread)
router.delete('/threads/:id', assistantController.deleteThread)
// The only route here that reaches the model. Listing, renaming and deleting
// conversations stay uncapped.
router.post(
  '/threads/:id/messages',
  aiChatBurstLimiter,
  aiChatDailyLimiter,
  assistantController.sendMessage,
)

export default router
