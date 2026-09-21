import {
  CalendarDays,
  Check,
  MapPin,
  MoreVertical,
  Pencil,
  StickyNote,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Application, ApplicationStatus } from '../../types'
import { cn } from '../../lib/cn'
import { formatShortDate, getDeadlineMeta } from '../../lib/dates'
import { Avatar } from '../Avatar'
import { Card } from '../Card'
import { StatusBadge } from '../StatusBadge'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  APPLICATION_STATUSES,
} from './applicationMeta'

interface ApplicationCardProps {
  application: Application
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
  onStatusChange: (id: string, status: ApplicationStatus) => void
}

function CardMenu({
  application,
  onEdit,
  onDelete,
  onStatusChange,
}: ApplicationCardProps) {
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
        aria-label={`Actions for ${application.role} at ${application.company}`}
        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      >
        <MoreVertical aria-hidden="true" className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
        >
          <button
            role="menuitem"
            type="button"
            onClick={run(() => onEdit(application))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <Pencil aria-hidden="true" className="h-4 w-4 text-neutral-400" />
            Edit application
          </button>

          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Move to
          </p>

          {APPLICATION_STATUSES.map((status) => {
            const isCurrent = status === application.status
            return (
              <button
                key={status}
                role="menuitem"
                type="button"
                disabled={isCurrent}
                onClick={run(() => onStatusChange(application.id, status))}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-1.5 pl-9 text-left text-sm transition-colors',
                  isCurrent
                    ? 'cursor-default text-neutral-400'
                    : 'text-neutral-700 hover:bg-neutral-50',
                )}
              >
                {APPLICATION_STATUS_LABELS[status]}
                {isCurrent ? (
                  <Check aria-hidden="true" className="h-3.5 w-3.5" />
                ) : null}
              </button>
            )
          })}

          <div className="my-1 border-t border-neutral-100" />

          <button
            role="menuitem"
            type="button"
            onClick={run(() => onDelete(application))}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Delete application
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ApplicationCard({
  application,
  onEdit,
  onDelete,
  onStatusChange,
}: ApplicationCardProps) {
  const deadline = application.deadline ? getDeadlineMeta(application.deadline) : null
  const dateLabel = application.status === 'SAVED' ? 'Saved' : 'Applied'

  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar label={application.company} className="h-9 w-9 rounded-lg text-xs" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {application.company}
            </p>
            <p className="flex items-center gap-1 text-xs text-neutral-500">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{application.location}</span>
            </p>
          </div>
        </div>
        <CardMenu
          application={application}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      </div>

      <button
        type="button"
        onClick={() => onEdit(application)}
        className="mt-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        title={`Edit ${application.role} at ${application.company}`}
      >
        <span className="block truncate text-sm font-medium text-neutral-900 transition-colors hover:text-primary-700">
          {application.role}
        </span>
      </button>

      <div className="mt-2.5">
        <StatusBadge
          label={APPLICATION_STATUS_LABELS[application.status]}
          tone={APPLICATION_STATUS_TONES[application.status]}
        />
      </div>

      <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3">
        <p className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-neutral-500">
            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {dateLabel}{' '}
            {application.appliedAt ? formatShortDate(application.appliedAt) : '—'}
          </span>
          {application.notes ? (
            <span
              className="inline-flex items-center gap-1 font-medium text-primary-600"
              title={application.notes}
            >
              <StickyNote aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              Notes
            </span>
          ) : null}
        </p>
        {deadline ? (
          <p
            className={cn(
              'inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium',
              deadline.className,
            )}
          >
            Deadline {deadline.label}
          </p>
        ) : null}
      </div>
    </Card>
  )
}