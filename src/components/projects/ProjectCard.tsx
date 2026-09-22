import {
  CalendarClock,
  ExternalLink,
  FolderKanban,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../types'
import { formatShortDate } from '../../lib/dates'
import { Card } from '../Card'
import { GitHubIcon } from '../GitHubIcon'
import { StatusBadge } from '../StatusBadge'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_TONES } from './projectMeta'

interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

function ProjectCardMenu({
  project,
  onEdit,
  onDelete,
}: Pick<ProjectCardProps, 'project' | 'onEdit' | 'onDelete'>) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const run = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${project.name}`}
        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      >
        <MoreVertical aria-hidden="true" className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
        >
          <button
            role="menuitem"
            type="button"
            onClick={run(() => onEdit(project))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <Pencil aria-hidden="true" className="h-4 w-4 text-neutral-400" />
            Edit project
          </button>

          <div className="my-1 border-t border-neutral-100" />

          <button
            role="menuitem"
            type="button"
            onClick={run(() => onDelete(project))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Delete project
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ProjectCard({
  project,
  onView,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const techLimit = 4
  const visibleTechnologies = project.technologies.slice(0, techLimit)
  const extraCount = project.technologies.length - visibleTechnologies.length

  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onView(project)}
          className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          title={`View ${project.name}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <FolderKanban aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-neutral-900 transition-colors hover:text-primary-700">
              {project.name}
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
              <CalendarClock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              Updated {formatShortDate(project.updatedAt)}
            </span>
          </span>
        </button>
        <ProjectCardMenu project={project} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <button
        type="button"
        onClick={() => onView(project)}
        className="mt-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        title={`View ${project.name}`}
      >
        <span className="line-clamp-2 text-sm leading-relaxed text-neutral-600 transition-colors hover:text-neutral-900">
          {project.description}
        </span>
      </button>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {visibleTechnologies.map((technology) => (
          <span
            key={technology}
            className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
          >
            {technology}
          </span>
        ))}
        {extraCount > 0 ? (
          <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
            +{extraCount}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
        <StatusBadge
          label={PROJECT_STATUS_LABELS[project.status]}
          tone={PROJECT_STATUS_TONES[project.status]}
        />
        <div className="flex items-center gap-1">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open GitHub repository"
              aria-label={`${project.name} on GitHub`}
              onClick={(event) => event.stopPropagation()}
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
          ) : null}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open live demo"
              aria-label={`${project.name} live demo`}
              onClick={(event) => event.stopPropagation()}
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  )
}