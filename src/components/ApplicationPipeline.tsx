import type { ApplicationStatus } from '../types'
import { useAppStore } from '../store/useAppStore'
import { Card } from './Card'
import { SectionHeader } from './SectionHeader'
import type { BadgeTone } from './StatusBadge'
import { StatusBadge } from './StatusBadge'

const STATUS_ORDER: ApplicationStatus[] = [
  'Saved',
  'Applied',
  'OA',
  'Interview',
  'Selected',
  'Rejected',
]

const statusTone: Record<ApplicationStatus, BadgeTone> = {
  Saved: 'neutral',
  Applied: 'blue',
  OA: 'amber',
  Interview: 'purple',
  Selected: 'green',
  Rejected: 'red',
}

const barClass: Record<ApplicationStatus, string> = {
  Saved: 'bg-neutral-300',
  Applied: 'bg-sky-500',
  OA: 'bg-amber-500',
  Interview: 'bg-violet-500',
  Selected: 'bg-emerald-500',
  Rejected: 'bg-rose-500',
}

export function ApplicationPipeline() {
  const counts = useAppStore((s) => s.applicationCounts)
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0) || 1

  return (
    <Card className="p-5">
      <SectionHeader
        title="Application Pipeline"
        subtitle="Track every stage of your job search"
      />
      <div className="mt-5 space-y-5">
        <div
          className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-100"
          role="img"
          aria-label={`Application funnel: ${total} total applications`}
        >
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className={`h-full ${barClass[status]}`}
              style={{ width: `${(counts[status] / total) * 100}%` }}
            />
          ))}
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {STATUS_ORDER.map((status) => (
            <li
              key={status}
              className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3"
            >
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-900">
                {counts[status]}
              </p>
              <div className="mt-1">
                <StatusBadge label={status} tone={statusTone[status]} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}