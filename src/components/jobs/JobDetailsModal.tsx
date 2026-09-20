import { Bookmark, CalendarClock, Clock, ExternalLink, MapPin, X } from 'lucide-react'
import { useEffect } from 'react'
import type { Job } from '../../types'
import { formatDate, formatShortDate, getDeadlineMeta } from '../../lib/dates'
import { cn } from '../../lib/cn'
import { Avatar } from '../Avatar'
import { Button } from '../Button'
import { StatusBadge } from '../StatusBadge'
import { jobTypeLabel, jobTypeTone } from './jobMeta'

interface JobDetailsModalProps {
  job: Job
  saved: boolean
  onClose: () => void
  onToggleSave: (jobId: string) => void
}

export function JobDetailsModal({
  job,
  saved,
  onClose,
  onToggleSave,
}: JobDetailsModalProps) {
  const deadline = getDeadlineMeta(job.deadline)

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

  const handleApply = () => {
    if (job.applicationUrl) {
      window.open(job.applicationUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-details-title"
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
            <Avatar label={job.company} className="h-11 w-11 rounded-lg text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {job.company}
              </p>
              <p className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                Posted {formatShortDate(job.postedAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close job details"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <h2
            id="job-details-title"
            className="text-xl font-semibold tracking-tight text-neutral-900"
          >
            {job.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge label={jobTypeLabel[job.type]} tone={jobTypeTone[job.type]} />
            <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {job.experience}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                Location
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-900">
                {job.location}
              </dd>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" />
                Deadline
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                {formatDate(job.deadline)}
                <span
                  className={cn(
                    'inline-flex rounded-md px-1.5 py-0.5 text-[11px]',
                    deadline.className,
                  )}
                >
                  {deadline.label}
                </span>
              </dd>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                Posted
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-900">
                {formatDate(job.postedAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-neutral-900">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-neutral-900">
              About the role
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {job.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button variant="secondary" onClick={() => onToggleSave(job.id)}>
            <Bookmark
              aria-hidden="true"
              className={cn('h-4 w-4', saved && 'fill-current')}
            />
            {saved ? 'Saved' : 'Save job'}
          </Button>
          <Button
            onClick={handleApply}
            disabled={!job.applicationUrl}
            title={job.applicationUrl ? 'Open application link in new tab' : 'No application link available'}
          >
            Apply now
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}