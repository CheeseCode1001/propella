import { Router, type IRouter } from 'express'
import { authenticate } from '../../middleware/auth'
import { getStatus } from './entitlements.controller'

export const entitlementsRouter: IRouter = Router()

entitlementsRouter.use(authenticate)
entitlementsRouter.get('/status', getStatus)
