import { Request, Response, NextFunction } from 'express'
import * as coursesService from './courses.service'

function requireUser(req: Request): string {
  const userId = req.user?.id
  if (!userId) throw new Error('Unauthenticated')
  return userId
}

export async function getCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await coursesService.listCourses(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await coursesService.createCourse(userId, req.body)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await coursesService.deleteCourse(userId, req.params.courseId as string)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await coursesService.uploadCourseFile(userId, req.params.courseId as string, req.body)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getAllFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await coursesService.listAllFiles(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await coursesService.deleteCourseFile(userId, req.params.fileId as string)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}
