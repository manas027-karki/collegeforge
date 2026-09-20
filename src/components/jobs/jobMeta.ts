import type { JobType } from '../../types'
import type { BadgeTone } from '../StatusBadge'

export type JobSort = 'newest' | 'deadline'

export const JOB_TYPES: JobType[] = ['Internship', 'Full-time', 'Contract']

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