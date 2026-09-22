import {
  CalendarClock,
  CalendarDays,
  ExternalLink,
  FolderKanban,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import type { Project } from '../../types'
import { formatDate } from '../../lib/dates'
import { Button } from '../Button'
import { GitHubIcon } from '../GitHubIcon'
import { StatusBadge } from '../StatusBadge'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_TONES } from './projectMeta'

interface ProjectDetailsModalProps {
  project: Project
  onClose: () => void
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban
  label: string
  value?: string
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-neutral-900">
        {value ?? '—'}
      </dd>
    </div>
  )
}

export function ProjectDetailsModal({
  project,
  onClose,
}: ProjectDetailsModalProps) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const openUrl = (url: string | undefined) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-details-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FolderKanban aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {project.name}
              </p>
              <p className="flex items-center gap-1 text-xs text-neutral-500">
                <CalendarClock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                Last updated {formatDate(project.updatedAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={PROJECT_STATUS_LABELS[project.status]}
              tone={PROJECT_STATUS_TONES[project.status]}
            />
            <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {project.technologies.length} technologies
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-neutral-900">Description</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
              {project.description}
            </p>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-neutral-900">Technologies</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.technologies.map((technology) => (
                <span
                  key={technology}
                  className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              icon={CalendarDays}
              label="Start date"
              value={project.startDate ? formatDate(project.startDate) : undefined}
            />
            <DetailItem
              icon={CalendarDays}
              label="End date"
              value={project.endDate ? formatDate(project.endDate) : undefined}
            />
            <DetailItem
              icon={FolderKanban}
              label="Created"
              value={formatDate(project.createdAt)}
            />
            <DetailItem
              icon={CalendarClock}
              label="Last updated"
              value={formatDate(project.updatedAt)}
            />
          </dl>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {project.githubUrl ? (
            <Button onClick={() => openUrl(project.githubUrl)}>
              <GitHubIcon className="h-4 w-4" />
              GitHub
            </Button>
          ) : null}
          {project.liveUrl ? (
            <Button onClick={() => openUrl(project.liveUrl)}>
              Live Demo
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}