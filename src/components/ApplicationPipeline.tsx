import { useMemo } from 'react'
import type { ApplicationStatus } from '../types'
import { useAppStore } from '../store/useAppStore'
import { Card } from './Card'
import { SectionHeader } from './SectionHeader'
import type { BadgeTone } from './StatusBadge'
import { StatusBadge } from './StatusBadge'

const STATUS_ORDER: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'OA',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
]

const statusTone: Record<ApplicationStatus, BadgeTone> = {
  SAVED: 'neutral',
  APPLIED: 'blue',
  OA: 'amber',
  INTERVIEW: 'purple',
  SELECTED: 'green',
  REJECTED: 'red',
}

const barClass: Record<ApplicationStatus, string> = {
  SAVED: 'bg-neutral-300',
  APPLIED: 'bg-sky-500',
  OA: 'bg-amber-500',
  INTERVIEW: 'bg-violet-500',
  SELECTED: 'bg-emerald-500',
  REJECTED: 'bg-rose-500',
}

export function ApplicationPipeline() {
  const applications = useAppStore((s) => s.applications)

  const counts = useMemo(() => {
    const base: Record<ApplicationStatus, number> = {
      SAVED: 0,
      APPLIED: 0,
      OA: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    }
    for (const application of applications) {
      base[application.status] += 1
    }
    return base
  }, [applications])

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