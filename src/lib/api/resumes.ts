/**
 * Resume endpoints, mirroring `backend/src/routes/resumes.routes.ts`.
 *
 *   GET    /api/resumes          list the signed-in user's resumes
 *   POST   /api/resumes          create a resume, and make it current
 *   GET    /api/resumes/:id      read one resume
 *   PATCH  /api/resumes/:id      update a resume, partially
 *   POST   /api/resumes/:id/current  make a resume the current one
 *   DELETE /api/resumes/:id      delete a resume
 */
import { apiRequest } from './client'
import type { Resume, ResumeFileType, ResumeStatus } from '../../types'

/**
 * A resume as the API returns it.
 *
 * `fileUrl` is null until object storage is wired up. The API never accepts
 * one from the client, so the server is the only thing that can set it.
 */
export interface ApiResume {
  id: string
  fileName: string
  fileUrl: string | null
  targetRole: string
  version: number
  status: ResumeStatus
  fileType: ResumeFileType
  fileSize: number | null
  uploadedAt: string
  updatedAt: string
}

/**
 * The shape the API accepts when creating a resume.
 *
 * There is no `fileUrl` here on purpose: the file itself is not uploaded,
 * only its metadata.
 */
export interface CreateResumePayload {
  fileName: string
  targetRole: string
  fileType: ResumeFileType
  fileSize?: number | null
}

/** The shape the API accepts when updating a resume. */
export interface UpdateResumePayload {
  fileName?: string
  targetRole?: string
  status?: 'ARCHIVED'
}

/**
 * Converts a resume from the API into the app's shape.
 *
 * `localFileUrl` is a blob URL the browser made for a file the user just
 * picked. It only works for this session, so it is kept out of the request
 * and only used to let the user download the file they just uploaded.
 */
export const toResume = (resume: ApiResume, localFileUrl?: string): Resume => ({
  id: resume.id,
  fileName: resume.fileName,
  fileUrl: localFileUrl ?? resume.fileUrl ?? undefined,
  targetRole: resume.targetRole,
  version: resume.version,
  status: resume.status,
  fileType: resume.fileType,
  fileSize: resume.fileSize ?? undefined,
  uploadedAt: resume.uploadedAt,
  updatedAt: resume.updatedAt,
})

export const resumesApi = {
  /** Lists the signed-in user's resumes. */
  list: () => apiRequest<{ data: ApiResume[] }>({ method: 'GET', url: '/api/resumes' }),

  /** Creates a resume. The server assigns the version and makes it current. */
  create: (payload: CreateResumePayload) =>
    apiRequest<{ data: ApiResume }>({
      method: 'POST',
      url: '/api/resumes',
      data: payload,
    }),

  /** Applies a partial update. */
  update: (id: string, payload: UpdateResumePayload) =>
    apiRequest<{ data: ApiResume }>({
      method: 'PATCH',
      url: `/api/resumes/${id}`,
      data: payload,
    }),

  /**
   * Makes a resume the current one and archives the others.
   *
   * A separate endpoint rather than a PATCH, because the promotion has a
   * side effect the client should not have to reproduce.
   */
  setCurrent: (id: string) =>
    apiRequest<{ data: ApiResume }>({
      method: 'POST',
      url: `/api/resumes/${id}/current`,
    }),

  /** Deletes a resume. */
  remove: (id: string) =>
    apiRequest<Record<string, never>>({
      method: 'DELETE',
      url: `/api/resumes/${id}`,
    }),
}
