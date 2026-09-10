import { Router, type IRouter } from 'express'
import * as assistantController from './assistant.controller'

const router: IRouter = Router()

router.get('/threads', assistantController.getThreads)
router.post('/threads', assistantController.createThread)
router.get('/threads/:id', assistantController.getThread)
router.patch('/threads/:id', assistantController.renameThread)
router.delete('/threads/:id', assistantController.deleteThread)
router.post('/threads/:id/messages', assistantController.sendMessage)

export default router
