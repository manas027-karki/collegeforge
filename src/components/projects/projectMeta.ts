import type { ProjectStatus } from '../../types'
import type { BadgeTone } from '../StatusBadge'

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'ARCHIVED',
]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
}

export const PROJECT_STATUS_TONES: Record<ProjectStatus, BadgeTone> = {
  PLANNED: 'neutral',
  IN_PROGRESS: 'blue',
  COMPLETED: 'green',
  ARCHIVED: 'amber',
}