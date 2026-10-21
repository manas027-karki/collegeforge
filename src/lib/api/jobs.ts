/**
 * Job board endpoints, mirroring `backend/src/routes/jobs.routes.ts`.
 *
 *   GET /api/jobs      list the job board, filtered and paginated
 *   GET /api/jobs/:id  read one job
 *
 * These are public. The job board is a catalogue anyone can browse, so no
 * credentials are needed and none are sent.
 */
import { apiRequest } from './client'
import type {
  ExperienceLevel,
  Job,
  JobType,
} from '../../types'

/**
 * The job type as the API sends it.
 *
 * The API speaks in the database's enum values and the UI speaks in labels,
 * so the two are deliberately different types with different names.
 */
export type ApiJobType = 'INTERNSHIP' | 'FULL_TIME' | 'CONTRACT'

/** The experience level as the API sends it. */
export type ApiExperienceLevel = 'FRESHER' | 'ONE_TO_TWO_YEARS' | 'THREE_TO_FIVE_YEARS'

/** A company as the API returns it. */
export interface ApiCompany {
  id: string
  name: string
  logoUrl: string | null
  websiteUrl: string | null
}

/** A job as the API returns it, with its company expanded. */
export interface ApiJob {
  id: string
  title: string
  location: string
  type: ApiJobType
  experience: ApiExperienceLevel
  skills: string[]
  description: string
  applicationUrl: string | null
  deadline: string | null
  postedAt: string
  createdAt: string
  updatedAt: string
  company: ApiCompany
}

/** The page metadata the list endpoint returns alongside the jobs. */
export interface ApiJobMeta {
  page: number
  pageSize: number
  /** How many jobs match the current filters. */
  total: number
  /** How many jobs there are in the whole catalogue. */
  totalAll: number
  totalPages: number
  /** Every location in the catalogue, not just the ones on this page. */
  locations: string[]
}

/** The filters the job board accepts. */
export interface JobQuery {
  search?: string
  location?: string
  type?: ApiJobType
  experience?: ApiExperienceLevel
  company?: string
  sort?: 'newest' | 'deadline'
  page?: number
  pageSize?: number
}

/**
 * The database's enum values mapped to the labels the UI shows.
 */
const JOB_TYPE_LABELS: Record<ApiJobType, JobType> = {
  INTERNSHIP: 'Internship',
  FULL_TIME: 'Full-time',
  CONTRACT: 'Contract',
}

const EXPERIENCE_LABELS: Record<ApiExperienceLevel, ExperienceLevel> = {
  FRESHER: 'Fresher',
  ONE_TO_TWO_YEARS: '1-2 years',
  THREE_TO_FIVE_YEARS: '3-5 years',
}

/**
 * Converts a job from the API into the app's shape.
 *
 * The API returns the company as an object and the job type as an enum
 * value; the UI wants a company name and a human label. `saved` is the user's
 * own state rather than part of the job, so it is passed in.
 */
export const toJob = (job: ApiJob, saved = false): Job => ({
  id: job.id,
  company: job.company.name,
  title: job.title,
  location: job.location,
  type: JOB_TYPE_LABELS[job.type],
  experience: EXPERIENCE_LABELS[job.experience],
  deadline: job.deadline ? job.deadline.slice(0, 10) : '',
  postedAt: job.postedAt.slice(0, 10),
  skills: job.skills,
  saved,
  description: job.description,
  applicationUrl: job.applicationUrl ?? undefined,
})

export const jobsApi = {
  /** Lists the job board. */
  list: (query: JobQuery = {}) =>
    apiRequest<{ data: ApiJob[]; meta: ApiJobMeta }>({
      method: 'GET',
      url: '/api/jobs',
      params: query,
    }),

  /** Reads one job. */
  get: (id: string) =>
    apiRequest<{ data: ApiJob }>({ method: 'GET', url: `/api/jobs/${id}` }),
}
