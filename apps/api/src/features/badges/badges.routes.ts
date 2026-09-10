import { Router, type IRouter } from 'express'
import * as badgesController from './badges.controller'

const router: IRouter = Router()

router.get('/', badgesController.listBadges)

export default router
