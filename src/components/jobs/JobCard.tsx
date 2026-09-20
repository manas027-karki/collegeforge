import { Bookmark, Clock, ExternalLink, MapPin } from 'lucide-react'
import type { Job } from '../../types'
import { formatShortDate, getDeadlineMeta } from '../../lib/dates'
import { cn } from '../../lib/cn'
import { Avatar } from '../Avatar'
import { Button } from '../Button'
import { Card } from '../Card'
import { StatusBadge } from '../StatusBadge'
import { jobTypeLabel, jobTypeTone } from './jobMeta'

interface JobCardProps {
  job: Job
  saved: boolean
  onToggleSave: (jobId: string) => void
  onViewDetails: (job: Job) => void
}

export function JobCard({ job, saved, onToggleSave, onViewDetails }: JobCardProps) {
  const deadline = getDeadlineMeta(job.deadline)
  const handleApply = () => {
    if (job.applicationUrl) {
      window.open(job.applicationUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar label={job.company} className="h-10 w-10 rounded-lg text-sm" />
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
          onClick={() => onToggleSave(job.id)}
          aria-pressed={saved}
          aria-label={saved ? `Unsave ${job.title} at ${job.company}` : `Save ${job.title} at ${job.company}`}
          title={saved ? 'Unsave job' : 'Save job'}
          className={cn(
            'rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
            saved
              ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700',
          )}
        >
          <Bookmark
            aria-hidden="true"
            className={cn('h-[18px] w-[18px]', saved && 'fill-current')}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onViewDetails(job)}
        className="mt-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <span className="block text-base font-semibold tracking-tight text-neutral-900 transition-colors hover:text-primary-700">
          {job.title}
        </span>
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
          <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-400" />
          <span className="truncate">{job.location}</span>
        </span>
        <StatusBadge label={jobTypeLabel[job.type]} tone={jobTypeTone[job.type]} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <span
          className={cn(
            'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
            deadline.className,
          )}
        >
          {deadline.label}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onViewDetails(job)}>
            Details
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!job.applicationUrl}
            title={job.applicationUrl ? 'Open application link' : 'No application link available'}
          >
            Apply
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}