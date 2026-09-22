import type { StudyTaskSort, TaskPriority, TaskStatus } from '../../types'
import type { BadgeTone } from '../StatusBadge'
import { daysUntil, formatShortDate } from '../../lib/dates'

export const TASK_CATEGORIES: readonly string[] = [
  'DSA',
  'Development',
  'DBMS',
  'Java',
  'Computer Networks',
  'Theory',
  'Projects',
  'Placement',
  'Other',
]

export const TASK_STATUSES: readonly TaskStatus[] = ['TODO', 'COMPLETED']

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  COMPLETED: 'Completed',
}

export const TASK_PRIORITIES: readonly TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH']

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export const TASK_PRIORITY_TONES: Record<TaskPriority, BadgeTone> = {
  LOW: 'neutral',
  MEDIUM: 'amber',
  HIGH: 'red',
}

export const TASK_PRIORITY_ORDER: Record<TaskPriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
}

export const TASK_SORT_OPTIONS: ReadonlyArray<{
  value: StudyTaskSort
  label: string
}> = [
  { value: 'DUE_DATE', label: 'Due date' },
  { value: 'PRIORITY', label: 'Priority' },
  { value: 'CREATED_DATE', label: 'Created date' },
]

export function formatMinutes(minutes?: number): string {
  if (!minutes || minutes <= 0) return ''
  return `${minutes} min`
}

export function getDueLabel(dateIso: string): string {
  const days = daysUntil(dateIso)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return formatShortDate(dateIso)
}