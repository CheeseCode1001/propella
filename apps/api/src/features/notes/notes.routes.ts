import { Router, type IRouter } from 'express'
import * as notesController from './notes.controller'

const router: IRouter = Router()

router.get('/', notesController.listNotes)
router.post('/', notesController.createNote)
router.get('/:id', notesController.getNote)
router.patch('/:id', notesController.updateNote)
router.delete('/:id', notesController.deleteNote)

export default router
