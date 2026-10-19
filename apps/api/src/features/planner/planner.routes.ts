import { Router, type IRouter } from 'express'
import * as plannerController from './planner.controller'

const router: IRouter = Router()

router.get('/tasks', plannerController.listTasks)
router.post('/tasks', plannerController.createTask)
router.patch('/tasks/reorder', plannerController.reorderColumn)
router.post('/tasks/readjust', plannerController.readjustPlanner)
router.post('/readjust', plannerController.readjustPlanner)
router.patch('/tasks/:id', plannerController.updateTask)
router.delete('/tasks/:id', plannerController.deleteTask)

export default router
