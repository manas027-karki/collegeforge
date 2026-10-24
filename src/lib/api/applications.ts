/**
 * Application pipeline endpoints, mirroring `backend/src/routes/applications.routes.ts`.
 *
 *   GET    /api/applications          list the signed-in user's applications
 *   POST   /api/applications          create an application
 *   GET    /api/applications/:id      read one application
 *   PATCH  /api/applications/:id      update an application, partially
 *   PATCH  /api/applications/:id/status update application status
 *   DELETE /api/applications/:id      delete an application
 */
import { apiRequest } from './client'
import { toDateOnly } from '../dates'
import type { Application, ApplicationInput, ApplicationStatus } from '../../types'

/**
 * A job as nested in the API response.
 */
export interface ApiApplicationJob {
  id: string
  title: string
  location: string
  company: {
    id: string
    name: string
  }
}

/**
 * An application as the API returns it.
 *
 * The API returns relational data (job + company), while the UI expects
 * denormalized fields (company, role, location).
 */
export interface ApiApplication {
  id: string
  userId: string
  jobId: string
  status: ApplicationStatus
  appliedAt: string | null
  deadline: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  job: ApiApplicationJob
}

/**
 * The shape the API accepts when creating an application.
 */
export interface CreateApplicationPayload {
  jobId: string
  status?: ApplicationStatus
  appliedAt?: string | null
  deadline?: string | null
  notes?: string | null
}

/**
 * The shape the API accepts when updating an application.
 */
export interface UpdateApplicationPayload {
  status?: ApplicationStatus
  appliedAt?: string | null
  deadline?: string | null
  notes?: string | null
}

/**
 * Converts an application from the API into the app's shape.
 *
 * The API is relational; we flatten job.company.name and job.title into
 * the UI's denormalized shape.
 */
export const toApplication = (application: ApiApplication): Application => ({
  id: application.id,
  jobId: application.jobId,
  company: application.job.company.name,
  role: application.job.title,
  location: application.job.location,
  status: application.status,
  appliedAt: application.appliedAt ? toDateOnly(application.appliedAt) : '',
  deadline: application.deadline ? toDateOnly(application.deadline) : undefined,
  notes: application.notes ?? undefined,
})

/**
 * Converts the form's values into the API's payload.
 */
export const toApplicationPayload = (values: ApplicationInput): CreateApplicationPayload => ({
  jobId: values.jobId,
  status: values.status,
  appliedAt: values.appliedAt || null,
  deadline: values.deadline || null,
  notes: values.notes || null,
})

export const applicationsApi = {
  /** Lists the signed-in user's applications. */
  list: () => apiRequest<{ data: ApiApplication[] }>({ method: 'GET', url: '/api/applications' }),

  /** Reads one application. */
  get: (id: string) =>
    apiRequest<{ data: ApiApplication }>({ method: 'GET', url: `/api/applications/${id}` }),

  /** Creates an application. */
  create: (payload: CreateApplicationPayload) =>
    apiRequest<{ data: ApiApplication }>({
      method: 'POST',
      url: '/api/applications',
      data: payload,
    }),

  /** Applies a partial update. */
  update: (id: string, payload: UpdateApplicationPayload) =>
    apiRequest<{ data: ApiApplication }>({
      method: 'PATCH',
      url: `/api/applications/${id}`,
      data: payload,
    }),

  /** Updates just the status. */
  updateStatus: (id: string, status: ApplicationStatus) =>
    apiRequest<{ data: ApiApplication }>({
      method: 'PATCH',
      url: `/api/applications/${id}/status`,
      data: { status },
    }),

  /** Deletes an application. */
  remove: (id: string) =>
    apiRequest<Record<string, never>>({
      method: 'DELETE',
      url: `/api/applications/${id}`,
    }),
}
