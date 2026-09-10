'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export type TaskStatus = 'todo' | 'doing' | 'done'

export interface PlannerTask {
  id: string
  title: string
  notes: string
  status: TaskStatus
  position: number
  dueDate: string | null
  subjectSlug: string | null
  topicSlug: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

const KEY = ['planner-tasks'] as const

export function usePlannerTasks() {
  return useQuery({
    queryKey: KEY,
    queryFn: () =>
      api.get<{ data: { tasks: PlannerTask[] } }>('/planner/tasks').then((r) => r.data.tasks),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { title: string; status?: TaskStatus; dueDate?: string | null }) =>
      api.post<{ data: { task: PlannerTask } }>('/planner/tasks', input).then((r) => r.data.task),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Omit<PlannerTask, 'id'>>) =>
      api
        .patch<{ data: { task: PlannerTask } }>(`/planner/tasks/${id}`, patch)
        .then((r) => r.data.task),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/planner/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

/**
 * Moves a card and rewrites the order of the column it lands in.
 *
 * The new order is written into the cache first so the card stays where it was
 * dropped; a failure rolls the board back rather than leaving it half-moved.
 */
export function useReorderColumn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ status, orderedIds }: { status: TaskStatus; orderedIds: string[] }) =>
      api
        .patch<{ data: { tasks: PlannerTask[] } }>('/planner/tasks/reorder', {
          status,
          orderedIds,
        })
        .then((r) => r.data.tasks),
    onMutate: async ({ status, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: KEY })
      const previous = queryClient.getQueryData<PlannerTask[]>(KEY)

      queryClient.setQueryData<PlannerTask[]>(KEY, (old) =>
        (old ?? []).map((task) => {
          const index = orderedIds.indexOf(task.id)
          return index === -1 ? task : { ...task, status, position: index }
        }),
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}
