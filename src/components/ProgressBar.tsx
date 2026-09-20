import { cn } from '../lib/cn'

interface ProgressBarProps {
  label?: string
  value: number
  total: number
  tone?: 'primary' | 'green' | 'amber' | 'red' | 'neutral'
  suffix?: string
  showLabel?: boolean
}

const barToneMap = {
  primary: 'bg-primary-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
  neutral: 'bg-neutral-400',
}

export function ProgressBar({
  label,
  value,
  total,
  tone = 'primary',
  suffix = 'solved',
  showLabel = true,
}: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0

  return (
    <div>
      {showLabel ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          <span className="text-sm tabular-nums text-neutral-500">
            {value} <span className="text-neutral-400">{suffix}</span>
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
        className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
      >
        <div
          className={cn('h-full rounded-full', barToneMap[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}