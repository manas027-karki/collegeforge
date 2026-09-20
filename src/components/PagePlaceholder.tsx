import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'

interface PagePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  action?: ReactNode
}

export function PagePlaceholder({
  title,
  description,
  icon,
  action,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>

      <EmptyState
        icon={icon}
        title="Module coming soon"
        description="This module ships in the next milestone. The page structure and mock data are already wired up."
        action={action}
      />
    </div>
  )
}