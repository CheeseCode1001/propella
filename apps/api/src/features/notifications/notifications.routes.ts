import { Router, type IRouter } from 'express'
import * as notificationsController from './notifications.controller'

const router: IRouter = Router()

router.get('/', notificationsController.listNotifications)
router.get('/unread-count', notificationsController.getUnreadCount)
router.patch('/read-all', notificationsController.markAllRead)
router.patch('/:id/read', notificationsController.markRead)
// Web push. The key route is before /:id so it is not read as an id.
router.get('/push/key', notificationsController.getPushKey)
router.post('/push/subscribe', notificationsController.subscribePush)
router.post('/push/unsubscribe', notificationsController.unsubscribePush)
router.post('/push/test', notificationsController.sendTestPush)

router.delete('/:id', notificationsController.deleteNotification)

export default router
