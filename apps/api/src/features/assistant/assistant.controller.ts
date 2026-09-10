import type { Request, Response, NextFunction } from 'express'
import * as assistantService from './assistant.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getThreads(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const threads = await assistantService.getThreads(userId)

    res.status(200).json({
      data: {
        threads: threads.map((t) => ({
          id: t.id,
          title: t.title,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function createThread(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const thread = await assistantService.createThread(userId)

    res.status(201).json({
      data: {
        id: thread.id,
        title: thread.title,
        createdAt: thread.createdAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getThread(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const thread = await assistantService.getThread(userId, req.params.id)

    res.status(200).json({
      data: {
        id: thread.id,
        title: thread.title,
        messages: thread.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          attachedTopic: m.attachedTopic,
        })),
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function renameThread(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { title } = req.body as { title?: unknown }

    if (typeof title !== 'string') {
      throw new AppError(400, 'A title is required')
    }

    const thread = await assistantService.renameThread(userId, req.params.id, title)

    res.status(200).json({
      data: {
        id: thread.id,
        title: thread.title,
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteThread(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await assistantService.deleteThread(userId, req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function sendMessage(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = requireUser(req)
  const { content, attachedTopic } = req.body as {
    content: string
    attachedTopic?: { subjectSlug: string; topicSlug: string }
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    await assistantService.streamMessage(
      userId,
      req.params.id,
      content,
      attachedTopic,
      (chunk: string) => {
        res.write(`data: ${chunk}\n\n`)
      },
    )

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    // If headers already sent, just end
    if (!res.headersSent) {
      next(err)
    } else {
      res.write(`data: [ERROR]\n\n`)
      res.end()
    }
  }
}
