/**
 * Project portfolio endpoints, mirroring `backend/src/routes/projects.routes.ts`.
 *
 *   GET    /api/projects       list the signed-in user's projects
 *   POST   /api/projects       create a project
 *   GET    /api/projects/:id   read one project
 *   PATCH  /api/projects/:id   update a project, partially
 *   DELETE /api/projects/:id   delete a project
 */
import { apiRequest } from './client'
import { toDateOnly } from '../dates'
import type { Project, ProjectInput, ProjectStatus } from '../../types'

/**
 * A project as the API returns it.
 *
 * The API stores dates as timestamps and treats an unset field as `null`,
 * while the UI uses optional fields and date-only strings.
 */
export interface ApiProject {
  id: string
  name: string
  description: string | null
  technologies: string[]
  status: ProjectStatus
  githubUrl: string | null
  liveUrl: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

/**
 * The shape the API accepts when writing a project.
 *
 * `null` clears a field. Omitting it leaves the field alone, which is what
 * makes the update endpoint a partial update.
 */
export interface ProjectPayload {
  name?: string
  description?: string | null
  technologies?: string[]
  status?: ProjectStatus
  githubUrl?: string | null
  liveUrl?: string | null
  startDate?: string | null
  endDate?: string | null
}

/**
 * Converts a project from the API into the app's shape.
 */
export const toProject = (project: ApiProject): Project => ({
  id: project.id,
  name: project.name,
  description: project.description ?? '',
  technologies: project.technologies,
  status: project.status,
  githubUrl: project.githubUrl ?? undefined,
  liveUrl: project.liveUrl ?? undefined,
  startDate: project.startDate ? toDateOnly(project.startDate) : undefined,
  endDate: project.endDate ? toDateOnly(project.endDate) : undefined,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
})

/**
 * Converts the form's values into the API's payload.
 *
 * The project form always submits every field, so an empty one is sent as
 * `null` to clear it rather than omitted, which would leave the stored value
 * in place.
 */
export const toProjectPayload = (values: ProjectInput): ProjectPayload => ({
  name: values.name,
  description: values.description || null,
  technologies: values.technologies,
  status: values.status,
  githubUrl: values.githubUrl || null,
  liveUrl: values.liveUrl || null,
  startDate: values.startDate || null,
  endDate: values.endDate || null,
})

export const projectsApi = {
  /** Lists the signed-in user's projects. */
  list: () => apiRequest<{ data: ApiProject[] }>({ method: 'GET', url: '/api/projects' }),

  /** Reads one project. */
  get: (id: string) =>
    apiRequest<{ data: ApiProject }>({ method: 'GET', url: `/api/projects/${id}` }),

  /** Creates a project. */
  create: (payload: ProjectPayload) =>
    apiRequest<{ data: ApiProject }>({
      method: 'POST',
      url: '/api/projects',
      data: payload,
    }),

  /** Applies a partial update. */
  update: (id: string, payload: ProjectPayload) =>
    apiRequest<{ data: ApiProject }>({
      method: 'PATCH',
      url: `/api/projects/${id}`,
      data: payload,
    }),

  /** Deletes a project. */
  remove: (id: string) =>
    apiRequest<Record<string, never>>({
      method: 'DELETE',
      url: `/api/projects/${id}`,
    }),
}
