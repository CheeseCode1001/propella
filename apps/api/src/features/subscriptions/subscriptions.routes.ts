import { Router, type IRouter } from 'express'
import { authenticate } from '../../middleware/auth'
import * as subController from './subscriptions.controller'

const router: IRouter = Router()

// Public webhook endpoint
router.post('/webhook', subController.webhook)

// Public or session-based verification callback
router.get('/verify/:reference', subController.verify)

// Authenticated endpoints
router.post('/initialize', authenticate, subController.initialize)
router.get('/current', authenticate, subController.getCurrent)
router.post('/cancel', authenticate, subController.cancel)
router.post('/link-shared', authenticate, subController.linkShared)

export default router
