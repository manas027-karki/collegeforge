import { Bell, CheckCircle2, FolderKanban, Inbox, PenLine, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { mockData } from '../data/mockData'
import type { ActivityType } from '../types'
import { cn } from '../lib/cn'

const activityIcon = {
  dsa: { icon: PenLine, className: 'bg-primary-50 text-primary-600' },
  project: { icon: FolderKanban, className: 'bg-violet-50 text-violet-600' },
  application: { icon: Inbox, className: 'bg-sky-50 text-sky-600' },
  task: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600' },
} satisfies Record<ActivityType, { icon: typeof PenLine; className: string }>

export function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKey)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        className="relative rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      >
        <Bell aria-hidden="true" className="h-5 w-5" />
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white"
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-900">Notifications</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {mockData.activities.map((activity) => {
              const config = activityIcon[activity.type]
              const Icon = config.icon
              return (
                <li
                  key={activity.id}
                  className="flex items-start gap-3 border-b border-neutral-50 px-4 py-3 hover:bg-neutral-50"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      config.className,
                    )}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-neutral-500">{activity.timestamp}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}