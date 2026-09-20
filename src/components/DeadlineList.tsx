import { ArrowRight, CalendarClock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mockData } from '../data/mockData'
import { daysUntil, formatShortDate } from '../lib/dates'
import { Avatar } from './Avatar'
import { Card } from './Card'
import { SectionHeader } from './SectionHeader'

function deadlinePill(days: number): string {
  if (days < 0) return 'text-neutral-500'
  if (days <= 5) return 'bg-rose-50 text-rose-700'
  return 'bg-neutral-100 text-neutral-600'
}

export function DeadlineList() {
  return (
    <Card className="p-5">
      <SectionHeader
        title="Upcoming Deadlines"
        subtitle="Submission windows closing soon"
        action={
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        }
      />

      <ul className="mt-4 divide-y divide-neutral-100">
        {mockData.deadlines.map((deadline) => {
          const days = daysUntil(deadline.deadline)
          return (
            <li key={deadline.id} className="flex items-center gap-3 py-3">
              <Avatar label={deadline.company} className="h-9 w-9 rounded-lg text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {deadline.company}
                </p>
                <p className="truncate text-sm text-neutral-500">{deadline.role}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400">
                  <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" />
                  {formatShortDate(deadline.deadline)}
                </span>
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${deadlinePill(days)}`}
                >
                  {days < 0 ? 'Closed' : days === 0 ? 'Today' : `${days} days left`}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}