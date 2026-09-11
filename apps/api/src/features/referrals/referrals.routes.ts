import { Router, type IRouter } from 'express'
import * as referralsController from './referrals.controller'

const router: IRouter = Router()

router.get('/', referralsController.getSummary)
router.get('/credits', referralsController.getCredits)

export default router
