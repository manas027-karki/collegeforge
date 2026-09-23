import type { LucideIcon } from 'lucide-react'

interface EmptyAnalyticsProps {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyAnalytics({ icon: Icon, title, description }: EmptyAnalyticsProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-neutral-400 shadow-sm ring-1 ring-neutral-200">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
    </div>
  )
}