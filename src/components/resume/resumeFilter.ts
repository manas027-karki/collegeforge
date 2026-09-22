import type { Resume, ResumeFilters } from '../../types'

export function filterResumes(
  resumes: Resume[],
  filters: ResumeFilters,
): Resume[] {
  const query = filters.search.trim().toLowerCase()

  const filtered = resumes.filter((resume) => {
    const matchesSearch =
      query === '' ||
      resume.fileName.toLowerCase().includes(query) ||
      resume.targetRole.toLowerCase().includes(query)
    const matchesStatus =
      filters.status === 'ALL' || resume.status === filters.status
    const matchesFileType =
      filters.fileType === 'ALL' || resume.fileType === filters.fileType

    return matchesSearch && matchesStatus && matchesFileType
  })

  const copy = [...filtered]

  switch (filters.sort) {
    case 'OLDEST':
      return copy.sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt))
    case 'VERSION':
      return copy.sort((a, b) => a.version - b.version)
    case 'NEWEST':
    default:
      return copy.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  }
}

export interface ResumeStatsData {
  total: number
  currentVersion: number | null
  currentRole: string
  archived: number
  latestVersion: number
}

export function getResumeStats(resumes: Resume[]): ResumeStatsData {
  const current = resumes.find((resume) => resume.status === 'CURRENT')
  return {
    total: resumes.length,
    currentVersion: current?.version ?? null,
    currentRole: current?.targetRole ?? 'No current resume',
    archived: resumes.filter((resume) => resume.status === 'ARCHIVED').length,
    latestVersion: resumes.reduce(
      (max, resume) => Math.max(max, resume.version),
      0,
    ),
  }
}

export function getNextResumeVersion(resumes: Resume[]): number {
  return resumes.reduce((max, resume) => Math.max(max, resume.version), 0) + 1
}