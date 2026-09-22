import type { ResumeFileType, ResumeSort, ResumeStatus } from '../../types'
import type { BadgeTone } from '../StatusBadge'

export const RESUME_STATUSES: readonly ResumeStatus[] = ['CURRENT', 'ARCHIVED']

export const RESUME_STATUS_LABELS: Record<ResumeStatus, string> = {
  CURRENT: 'Current',
  ARCHIVED: 'Archived',
}

export const RESUME_STATUS_TONES: Record<ResumeStatus, BadgeTone> = {
  CURRENT: 'green',
  ARCHIVED: 'neutral',
}

export const RESUME_FILE_TYPES: readonly ResumeFileType[] = ['PDF', 'DOCX']

export const RESUME_SORT_OPTIONS: ReadonlyArray<{
  value: ResumeSort
  label: string
}> = [
  { value: 'NEWEST', label: 'Newest' },
  { value: 'OLDEST', label: 'Oldest' },
  { value: 'VERSION', label: 'Version' },
]

export const TARGET_ROLES: readonly string[] = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI/ML Intern',
  'Data Analyst',
]

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileTypeFromName(fileName: string): ResumeFileType | null {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.pdf')) return 'PDF'
  if (lower.endsWith('.docx')) return 'DOCX'
  return null
}

export function isAllowedMimeType(mimeType: string): boolean {
  return (
    mimeType === '' ||
    mimeType === 'application/pdf' ||
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
}