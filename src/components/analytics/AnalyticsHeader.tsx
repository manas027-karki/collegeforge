import { TIME_RANGE_OPTIONS, getTimeRangeLabel } from '../../lib/analytics'
import type { TimeRange } from '../../lib/analytics'
import { cn } from '../../lib/cn'

interface AnalyticsHeaderProps {
  range: TimeRange
  onRangeChange: (range: TimeRange) => void
}

export function AnalyticsHeader({ range, onRangeChange }: AnalyticsHeaderProps) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Track your career preparation, applications, projects, and study consistency.
        </p>
      </div>

      <div
        role="group"
        aria-label="Time range"
        className="flex shrink-0 flex-wrap rounded-lg bg-neutral-100 p-1"
      >
        {TIME_RANGE_OPTIONS.map((option) => {
          const active = option.value === range
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              title={getTimeRangeLabel(option.value)}
              onClick={() => onRangeChange(option.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200'
                  : 'text-neutral-500 hover:bg-white/60 hover:text-neutral-800',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}