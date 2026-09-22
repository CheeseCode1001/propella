import { Router, type IRouter } from 'express'
import { authenticate } from '../../middleware/auth'
import * as coursesController from './courses.controller'

const router: IRouter = Router()

router.use(authenticate)

router.get('/', coursesController.getCourses)
router.post('/', coursesController.createCourse)
router.delete('/:courseId', coursesController.deleteCourse)

router.get('/files', coursesController.getAllFiles)
router.post('/:courseId/files', coursesController.uploadFile)
router.delete('/files/:fileId', coursesController.deleteFile)

export default router
