import { Router, type IRouter } from 'express'
import { authenticate } from '../../middleware/auth'
import * as studyGroupsController from './study-groups.controller'

const router: IRouter = Router()

router.use(authenticate)

router.get('/', studyGroupsController.listStudyGroups)
router.post('/', studyGroupsController.createStudyGroup)
router.get('/:id', studyGroupsController.getStudyGroup)
router.post('/:id/join', studyGroupsController.joinStudyGroup)
router.post('/:id/messages', studyGroupsController.postGroupMessage)
router.post('/:id/focus', studyGroupsController.startGroupFocus)

export default router
