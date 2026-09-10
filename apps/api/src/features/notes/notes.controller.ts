import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../../middleware/error-handler'
import * as notesService from './notes.service'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

function serialise(note: Awaited<ReturnType<typeof notesService.getNote>>) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    subjectSlug: note.subjectSlug,
    topicSlug: note.topicSlug,
    pinned: note.pinned,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }
}

export async function listNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined
    const notes = await notesService.listNotes(userId, search)
    res.status(200).json({ data: { notes: notes.map(serialise) } })
  } catch (err) {
    next(err)
  }
}

export async function getNote(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    res.status(200).json({ data: serialise(await notesService.getNote(userId, req.params.id)) })
  } catch (err) {
    next(err)
  }
}

export async function createNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const body = req.body as notesService.NoteInput
    res.status(201).json({ data: serialise(await notesService.createNote(userId, body)) })
  } catch (err) {
    next(err)
  }
}

export async function updateNote(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const body = req.body as notesService.NoteInput
    res.status(200).json({
      data: serialise(await notesService.updateNote(userId, req.params.id, body)),
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteNote(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await notesService.deleteNote(userId, req.params.id)
    res.status(200).json({ data: { deleted: true } })
  } catch (err) {
    next(err)
  }
}
