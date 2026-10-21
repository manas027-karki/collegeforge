import type { ApiJobType } from '../../lib/api'
import type { JobSort, JobType } from '../../types'
import type { BadgeTone } from '../StatusBadge'

export type { JobSort } from '../../types'

export const JOB_TYPES: JobType[] = ['Internship', 'Full-time', 'Contract']

/**
 * The job types the board can be filtered by, as the API names them.
 *
 * The filter is sent straight to the server, so its option values have to
 * be the API's enum values rather than the labels the cards display.
 */
export const JOB_TYPE_FILTERS: ApiJobType[] = [
  'INTERNSHIP',
  'FULL_TIME',
  'CONTRACT',
]

/** How each API job type is labelled in the filter dropdown. */
export const jobTypeFilterLabel: Record<ApiJobType, string> = {
  INTERNSHIP: 'Internship',
  FULL_TIME: 'Full-time',
  CONTRACT: 'Contract',
}

export const jobTypeTone: Record<JobType, BadgeTone> = {
  Internship: 'blue',
  'Full-time': 'green',
  Contract: 'amber',
}

export const jobTypeLabel: Record<JobType, string> = {
  Internship: 'Internship',
  'Full-time': 'Full-time',
  Contract: 'Contract',
}

export const sortOptions: Array<{ value: JobSort; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'deadline', label: 'Deadline soonest' },
]