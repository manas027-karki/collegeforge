import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

export type StatTone = 'neutral' | 'primary' | 'blue' | 'green' | 'amber'

const iconToneMap: Record<StatTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-600',
  primary: 'bg-primary-50 text-primary-600',
  blue: 'bg-sky-50 text-sky-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
}

interface StatCardProps {
  label: string
  value: string | number
  description: string
  icon: LucideIcon
  tone?: StatTone
  delta?: string
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'neutral',
  delta,
}: StatCardProps) {
  return (
    <div className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            iconToneMap[tone],
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm text-neutral-500">{description}</p>
        {delta ? (
          <p className="shrink-0 text-xs font-medium text-emerald-600">{delta}</p>
        ) : null}
      </div>
    </div>
  )
}