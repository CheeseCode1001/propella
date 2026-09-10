import { Router, type IRouter } from 'express'
import * as marathonController from './marathon.controller'

const router: IRouter = Router()

router.post('/start', marathonController.startMarathon)
router.post('/:id/pause', marathonController.pauseMarathon)
router.post('/:id/resume', marathonController.resumeMarathon)
router.post('/:id/end', marathonController.endMarathon)
router.post('/:id/abandon', marathonController.abandonMarathon)
router.get('/', marathonController.getMarathonHistory)

export default router
