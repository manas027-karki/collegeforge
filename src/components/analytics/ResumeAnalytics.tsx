import { useMemo } from 'react'
import { BadgeCheck, Clock, FileText, History } from 'lucide-react'
import { Card } from '../Card'
import { SectionHeader } from '../SectionHeader'
import { StatCard } from '../StatCard'
import { StatusBadge } from '../StatusBadge'
import { RESUME_STATUS_LABELS, RESUME_STATUS_TONES } from '../resume/resumeMeta'
import { EmptyAnalytics } from './EmptyAnalytics'
import { useAppStore } from '../../store/useAppStore'
import { formatShortDate } from '../../lib/dates'

export function ResumeAnalytics() {
  const resumes = useAppStore((s) => s.resumes)

  const current = useMemo(
    () => resumes.find((resume) => resume.status === 'CURRENT') ?? null,
    [resumes],
  )
  const archivedCount = useMemo(
    () => resumes.filter((resume) => resume.status === 'ARCHIVED').length,
    [resumes],
  )
  const latestVersion = useMemo(
    () => resumes.reduce((max, resume) => Math.max(max, resume.version), 0),
    [resumes],
  )
  const latestResume = useMemo(() => {
    return latestVersion > 0
      ? resumes.find((resume) => resume.version === latestVersion) ?? null
      : null
  }, [resumes, latestVersion])
  const versions = useMemo(
    () => [...resumes].sort((a, b) => b.version - a.version),
    [resumes],
  )

  if (resumes.length === 0) {
    return (
      <section aria-label="Resume analytics" className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          Resume Analytics
        </h2>
        <EmptyAnalytics
          icon={FileText}
          title="No resumes yet"
          description="Upload a resume to see version history and resume analytics."
        />
      </section>
    )
  }

  return (
    <section aria-label="Resume analytics" className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        Resume Analytics
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Resumes"
          value={resumes.length}
          description="All uploaded versions"
          icon={FileText}
          tone="primary"
        />
        <StatCard
          label="Current Resume"
          value={current?.targetRole ?? 'None'}
          description={
            current
              ? `v${current.version} · ${formatShortDate(current.updatedAt)}`
              : 'No current resume set'
          }
          icon={BadgeCheck}
          tone="green"
        />
        <StatCard
          label="Archived Resumes"
          value={archivedCount}
          description="Previous versions"
          icon={History}
          tone="neutral"
        />
        <StatCard
          label="Latest Version"
          value={latestVersion > 0 ? `v${latestVersion}` : '—'}
          description={latestResume?.fileName ?? 'No versions yet'}
          icon={Clock}
          tone="blue"
        />
      </div>

      <Card className="p-5">
        <SectionHeader
          title="Resume Versions"
          subtitle="Version history ordered by version number"
        />
        <ul className="mt-4 divide-y divide-neutral-100">
          {versions.map((resume) => (
            <li
              key={resume.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  <FileText aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    v{resume.version} · {resume.targetRole}
                  </p>
                  <p className="truncate text-xs text-neutral-500">{resume.fileName}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-xs tabular-nums text-neutral-500 sm:block">
                  {formatShortDate(resume.updatedAt)}
                </span>
                <StatusBadge
                  label={RESUME_STATUS_LABELS[resume.status]}
                  tone={RESUME_STATUS_TONES[resume.status]}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  )
}