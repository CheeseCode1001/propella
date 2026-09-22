import { Router, type IRouter } from 'express'
import * as referralsController from './referrals.controller'

const router: IRouter = Router()

router.get('/', referralsController.getSummary)
router.get('/credits', referralsController.getCredits)
router.post('/withdraw', referralsController.requestWithdrawal)
router.get('/withdrawals', referralsController.getWithdrawals)

export default router
