import type { Request, Response, NextFunction } from 'express'
import type { ExamType } from '../../config/db'
import { AppError } from '../../middleware/error-handler'
import * as adminService from './admin.service'

function requireAdminId(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

function pageParams(req: Request, defaultLimit = 25) {
  const page = Math.max(1, parseInt(String(req.query['page'] ?? '1'), 10) || 1)
  const limit = Math.min(
    200,
    Math.max(1, parseInt(String(req.query['limit'] ?? String(defaultLimit)), 10) || defaultLimit),
  )
  return { page, limit }
}

export async function getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdminId(req)
    res.status(200).json({ data: await adminService.getMetrics() })
  } catch (err) {
    next(err)
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdminId(req)
    const { page, limit } = pageParams(req)
    const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined
    res.status(200).json({
      data: await adminService.listUsers({ page, limit, ...(search ? { search } : {}) }),
    })
  } catch (err) {
    next(err)
  }
}

export async function setUserRole(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = requireAdminId(req)
    const { role } = req.body as { role?: string }
    if (role !== 'admin' && role !== 'student') {
      throw new AppError(400, 'role must be "admin" or "student"')
    }
    await adminService.setUserRole(adminId, req.params.id, role)
    res.status(200).json({ data: { id: req.params.id, role } })
  } catch (err) {
    next(err)
  }
}

export async function listAdmins(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const admins = await adminService.listAdmins()
    res.status(200).json({ data: { admins } })
  } catch (err) {
    next(err)
  }
}

export async function grantAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    requireAdminId(req)
    const { email } = req.body as { email?: unknown }
    if (typeof email !== 'string') {
      throw new AppError(400, 'An email address is required')
    }
    const admin = await adminService.grantAdminByEmail(email)
    res.status(200).json({ data: { admin } })
  } catch (err) {
    next(err)
  }
}

export async function importPastQuestions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = requireAdminId(req)
    const { filename, format, content } = req.body as {
      filename?: string
      format?: string
      content?: string
    }

    if (typeof content !== 'string' || content.trim() === '') {
      throw new AppError(400, 'content is required')
    }
    if (format !== 'csv' && format !== 'json') {
      throw new AppError(400, 'format must be "csv" or "json"')
    }

    const summary = await adminService.importPastQuestions({
      adminId,
      filename: filename?.trim() || 'upload',
      format,
      content,
    })

    res.status(200).json({ data: summary })
  } catch (err) {
    next(err)
  }
}

export async function listPastQuestions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    requireAdminId(req)
    const { page, limit } = pageParams(req)

    const examRaw = typeof req.query['exam'] === 'string' ? req.query['exam'] : undefined
    const exam = ['jamb', 'waec', 'neco'].includes(examRaw ?? '')
      ? (examRaw as ExamType)
      : undefined
    const subjectSlug =
      typeof req.query['subjectSlug'] === 'string' ? req.query['subjectSlug'] : undefined
    const yearRaw = parseInt(String(req.query['year'] ?? ''), 10)
    const year = Number.isInteger(yearRaw) ? yearRaw : undefined
    const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined

    res.status(200).json({
      data: await adminService.listPastQuestions({
        page,
        limit,
        ...(exam ? { exam } : {}),
        ...(subjectSlug ? { subjectSlug } : {}),
        ...(year ? { year } : {}),
        ...(search ? { search } : {}),
      }),
    })
  } catch (err) {
    next(err)
  }
}

export async function deletePastQuestion(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    requireAdminId(req)
    await adminService.deletePastQuestion(req.params.id)
    res.status(200).json({ data: { deleted: true } })
  } catch (err) {
    next(err)
  }
}

export async function listImports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdminId(req)
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query['limit'] ?? '20'), 10) || 20))
    res.status(200).json({ data: { batches: await adminService.listImportBatches(limit) } })
  } catch (err) {
    next(err)
  }
}

export async function getFacets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    requireAdminId(req)
    res.status(200).json({ data: await adminService.getPastQuestionFacets() })
  } catch (err) {
    next(err)
  }
}

export async function broadcast(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    requireAdminId(req)
    const { title, body, audience, deeplink } = req.body as {
      title?: unknown
      body?: unknown
      audience?: unknown
      deeplink?: unknown
    }

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new AppError(400, 'A title and message are required')
    }

    const target =
      audience === 'active' || audience === 'unverified' ? audience : 'all'

    const result = await adminService.broadcast({
      title,
      body,
      audience: target,
      deeplink: typeof deeplink === 'string' ? deeplink : null,
    })

    res.status(200).json({ data: result })
  } catch (err) {
    next(err)
  }
}
