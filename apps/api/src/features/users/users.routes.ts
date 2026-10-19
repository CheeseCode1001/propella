import { Router, type IRouter } from 'express'
import * as usersController from './users.controller'

const router: IRouter = Router()

router.get('/me', usersController.getMe)
router.patch('/me', usersController.updateMe)
router.patch('/exam-tracks', usersController.updateExamTracks)

export default router

