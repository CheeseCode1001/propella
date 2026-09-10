import { prisma } from '../../config/db'
import { AppError, NotFoundError } from '../../middleware/error-handler'

export type PlannerTaskStatus = 'todo' | 'doing' | 'done'

export const TASK_STATUSES: PlannerTaskStatus[] = ['todo', 'doing', 'done']

const MAX_TITLE_LENGTH = 160
const MAX_NOTES_LENGTH = 2000

export interface PlannerTaskDto {
  id: string
  title: string
  notes: string
  status: PlannerTaskStatus
  position: number
  dueDate: string | null
  subjectSlug: string | null
  topicSlug: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

interface TaskRow {
  id: string
  title: string
  notes: string
  status: PlannerTaskStatus
  position: number
  dueDate: Date | null
  subjectSlug: string | null
  topicSlug: string | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function toDto(row: TaskRow): PlannerTaskDto {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    status: row.status,
    position: row.position,
    dueDate: row.dueDate?.toISOString() ?? null,
    subjectSlug: row.subjectSlug,
    topicSlug: row.topicSlug,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listTasks(userId: string): Promise<PlannerTaskDto[]> {
  const rows = await prisma.plannerTask.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
  })
  return rows.map(toDto)
}

export interface CreateTaskInput {
  title: string
  notes?: string
  status?: PlannerTaskStatus
  dueDate?: string | null
  subjectSlug?: string | null
  topicSlug?: string | null
}

export async function createTask(
  userId: string,
  input: CreateTaskInput,
): Promise<PlannerTaskDto> {
  const title = input.title?.trim().slice(0, MAX_TITLE_LENGTH)
  if (!title) throw new AppError(400, 'A task needs a title')

  const status = input.status ?? 'todo'
  if (!TASK_STATUSES.includes(status)) throw new AppError(400, 'Unknown task status')

  // New cards go to the top of their column, where they are easiest to see.
  const first = await prisma.plannerTask.findFirst({
    where: { userId, status },
    orderBy: { position: 'asc' },
    select: { position: true },
  })

  const row = await prisma.plannerTask.create({
    data: {
      userId,
      title,
      notes: input.notes?.slice(0, MAX_NOTES_LENGTH) ?? '',
      status,
      position: (first?.position ?? 0) - 1,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      subjectSlug: input.subjectSlug ?? null,
      topicSlug: input.topicSlug ?? null,
      completedAt: status === 'done' ? new Date() : null,
    },
  })

  return toDto(row)
}

export interface UpdateTaskInput {
  title?: string
  notes?: string
  status?: PlannerTaskStatus
  position?: number
  dueDate?: string | null
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<PlannerTaskDto> {
  const existing = await prisma.plannerTask.findFirst({
    where: { id: taskId, userId },
    select: { id: true, status: true },
  })
  if (!existing) throw new NotFoundError('Task not found')

  if (input.status !== undefined && !TASK_STATUSES.includes(input.status)) {
    throw new AppError(400, 'Unknown task status')
  }

  const title = input.title !== undefined ? input.title.trim().slice(0, MAX_TITLE_LENGTH) : undefined
  if (input.title !== undefined && !title) {
    throw new AppError(400, 'A task needs a title')
  }

  // Moving in or out of "done" is what sets the completion stamp.
  const movingStatus = input.status !== undefined && input.status !== existing.status
  const completedAt = movingStatus
    ? input.status === 'done'
      ? new Date()
      : null
    : undefined

  const row = await prisma.plannerTask.update({
    where: { id: taskId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(input.notes !== undefined ? { notes: input.notes.slice(0, MAX_NOTES_LENGTH) } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
        : {}),
      ...(completedAt !== undefined ? { completedAt } : {}),
    },
  })

  return toDto(row)
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const existing = await prisma.plannerTask.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  })
  if (!existing) throw new NotFoundError('Task not found')

  await prisma.plannerTask.delete({ where: { id: taskId } })
}

/**
 * Rewrites the order of one column after a drag.
 *
 * The whole column is sent rather than a single index so the result cannot
 * drift out of order when two moves land close together.
 */
export async function reorderColumn(
  userId: string,
  status: PlannerTaskStatus,
  orderedIds: string[],
): Promise<PlannerTaskDto[]> {
  if (!TASK_STATUSES.includes(status)) throw new AppError(400, 'Unknown task status')

  const owned = await prisma.plannerTask.findMany({
    where: { id: { in: orderedIds }, userId },
    select: { id: true },
  })
  if (owned.length !== orderedIds.length) {
    throw new NotFoundError('One of those tasks no longer exists')
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.plannerTask.update({
        where: { id },
        data: {
          status,
          position: index,
          ...(status === 'done' ? {} : { completedAt: null }),
        },
      }),
    ),
  )

  return listTasks(userId)
}
