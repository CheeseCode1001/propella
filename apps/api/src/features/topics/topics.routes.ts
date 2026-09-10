import { Router, type IRouter } from 'express'
import * as topicsController from './topics.controller'

const router: IRouter = Router()

router.get('/:subjectSlug/:topicSlug', topicsController.getTopicReader)

export default router
