import { Router, type IRouter } from 'express'
import express from 'express'
import { requireAdmin } from '../../middleware/admin'
import * as adminController from './admin.controller'

const router: IRouter = Router()

// Every route below requires an admin account. `authenticate` is applied where
// this router is mounted in app.ts.
router.use(requireAdmin)

router.get('/metrics', adminController.getMetrics)

router.get('/users', adminController.listUsers)
router.patch('/users/:id/role', adminController.setUserRole)

// Announcements to students.
router.post('/broadcast', adminController.broadcast)

// Administrator management, kept separate from the general user list.
router.get('/admins', adminController.listAdmins)
router.post('/admins', adminController.grantAdmin)

// Question banks are big; allow a far larger body than the 1mb global limit.
router.post(
  '/past-questions/import',
  express.json({ limit: '25mb' }),
  adminController.importPastQuestions,
)
router.get('/past-questions', adminController.listPastQuestions)
router.get('/past-questions/facets', adminController.getFacets)
router.delete('/past-questions/:id', adminController.deletePastQuestion)

router.get('/imports', adminController.listImports)

export default router
