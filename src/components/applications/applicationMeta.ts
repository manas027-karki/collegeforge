import type { ApplicationStatus } from '../../types'
import type { BadgeTone } from '../StatusBadge'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'OA',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  OA: 'OA',
  INTERVIEW: 'Interview',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
}

export const APPLICATION_STATUS_TONES: Record<ApplicationStatus, BadgeTone> = {
  SAVED: 'neutral',
  APPLIED: 'blue',
  OA: 'amber',
  INTERVIEW: 'purple',
  SELECTED: 'green',
  REJECTED: 'red',
}

export const APPLICATION_STATUS_DOTS: Record<ApplicationStatus, string> = {
  SAVED: 'bg-neutral-400',
  APPLIED: 'bg-sky-500',
  OA: 'bg-amber-500',
  INTERVIEW: 'bg-violet-500',
  SELECTED: 'bg-emerald-500',
  REJECTED: 'bg-rose-500',
}

export const ACTIVE_APPLICATION_STATUSES: ReadonlyArray<ApplicationStatus> = [
  'SAVED',
  'APPLIED',
  'OA',
  'INTERVIEW',
]