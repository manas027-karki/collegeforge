/**
 * Study task endpoints, mirroring `backend/src/routes/study.routes.ts`.
 *
 *   GET    /api/study/tasks      list the signed-in user's tasks
 *   POST   /api/study/tasks      create a task
 *   GET    /api/study/tasks/:id  read one task
 *   PATCH  /api/study/tasks/:id  update a task, partially
 *   POST   /api/study/tasks/:id/toggle  flip between To Do and Completed
 *   DELETE /api/study/tasks/:id  delete a task
 */
import { apiRequest } from './client'
import { toDateOnly } from '../dates'
import type { StudyTask, StudyTaskInput, TaskPriority, TaskStatus } from '../../types'

/**
 * A study task as the API returns it.
 *
 * The API stores the due date as a timestamp and treats an unset field as
 * `null`, while the UI uses optional fields and date-only strings.
 */
export interface ApiStudyTask {
  id: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  category: string
  estimatedMinutes: number | null
  createdAt: string
  updatedAt: string
}

/**
 * The shape the API accepts when writing a task.
 *
 * `null` clears a field. Omitting it leaves the field alone, which is what
 * makes the update endpoint a partial update.
 */
export interface StudyTaskPayload {
  title?: string
  description?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string
  category?: string
  estimatedMinutes?: number | null
}

/** Converts a study task from the API into the app's shape. */
export const toStudyTask = (task: ApiStudyTask): StudyTask => ({
  id: task.id,
  title: task.title,
  description: task.description ?? undefined,
  priority: task.priority,
  status: task.status,
  // The planner groups tasks by day, and those comparisons are string
  // comparisons against a date-only value.
  dueDate: toDateOnly(task.dueDate),
  category: task.category,
  estimatedMinutes: task.estimatedMinutes ?? undefined,
  createdAt: task.createdAt,
})

/**
 * Converts the form's values into the API's payload.
 *
 * The task form always submits every field, so an empty one is sent as
 * `null` to clear it rather than omitted, which would leave the stored value
 * in place.
 */
export const toStudyTaskPayload = (values: StudyTaskInput): StudyTaskPayload => ({
  title: values.title,
  description: values.description || null,
  priority: values.priority,
  status: values.status,
  dueDate: values.dueDate,
  category: values.category,
  estimatedMinutes: values.estimatedMinutes ?? null,
})

export const studyTasksApi = {
  /** Lists the signed-in user's tasks. */
  list: () => apiRequest<{ data: ApiStudyTask[] }>({ method: 'GET', url: '/api/study/tasks' }),

  /** Reads one task. */
  get: (id: string) =>
    apiRequest<{ data: ApiStudyTask }>({ method: 'GET', url: `/api/study/tasks/${id}` }),

  /** Creates a task. */
  create: (payload: StudyTaskPayload) =>
    apiRequest<{ data: ApiStudyTask }>({
      method: 'POST',
      url: '/api/study/tasks',
      data: payload,
    }),

  /** Applies a partial update. */
  update: (id: string, payload: StudyTaskPayload) =>
    apiRequest<{ data: ApiStudyTask }>({
      method: 'PATCH',
      url: `/api/study/tasks/${id}`,
      data: payload,
    }),

  /**
   * Flips a task between `TODO` and `COMPLETED`.
   *
   * The client does not send the status: the server reads the current one and
   * writes the opposite, so the two sides cannot disagree.
   */
  toggle: (id: string) =>
    apiRequest<{ data: ApiStudyTask }>({
      method: 'POST',
      url: `/api/study/tasks/${id}/toggle`,
    }),

  /** Deletes a task. */
  remove: (id: string) =>
    apiRequest<Record<string, never>>({
      method: 'DELETE',
      url: `/api/study/tasks/${id}`,
    }),
}
