import { CheckCircle2, FolderKanban, Inbox, PenLine } from 'lucide-react'
import { mockData } from '../data/mockData'
import type { ActivityType } from '../types'
import { Card } from './Card'
import { SectionHeader } from './SectionHeader'

const activityIcon = {
  dsa: { icon: PenLine, className: 'bg-primary-50 text-primary-600' },
  project: { icon: FolderKanban, className: 'bg-violet-50 text-violet-600' },
  application: { icon: Inbox, className: 'bg-sky-50 text-sky-600' },
  task: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600' },
} satisfies Record<ActivityType, { icon: typeof PenLine; className: string }>

export function RecentActivity() {
  return (
    <Card className="p-5">
      <SectionHeader title="Recent Activity" subtitle="Your latest moves" />

      <ul className="mt-4">
        {mockData.activities.map((activity, index) => {
          const config = activityIcon[activity.type]
          const Icon = config.icon
          return (
            <li
              key={activity.id}
              className="relative flex items-center gap-3 py-3"
            >
              {index < mockData.activities.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[19px] top-9 bottom-0 w-px bg-neutral-100"
                />
              ) : null}
              <span
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.className}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {activity.title}
                </p>
                <p className="text-xs text-neutral-500">{activity.timestamp}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}