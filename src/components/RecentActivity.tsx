import { CheckCircle2, FolderKanban, Inbox, PenLine } from 'lucide-react'
import { useMemo } from 'react'
import type { ActivityType } from '../types'
import { Card } from './Card'
import { SectionHeader } from './SectionHeader'
import { useAppStore } from '../store/useAppStore'

const activityIcon = {
  dsa: { icon: PenLine, className: 'bg-primary-50 text-primary-600' },
  project: { icon: FolderKanban, className: 'bg-violet-50 text-violet-600' },
  application: { icon: Inbox, className: 'bg-sky-50 text-sky-600' },
  task: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600' },
} satisfies Record<ActivityType, { icon: typeof PenLine; className: string }>

export function RecentActivity() {
  const applications = useAppStore((s) => s.applications)
  const projects = useAppStore((s) => s.projects)
  const tasks = useAppStore((s) => s.tasks)
  const dsaProgress = useAppStore((s) => s.dsaProgress)
  const dsaProblems = useAppStore((s) => s.dsaProblems)

  const activities = useMemo(() => {
    const items: Array<{ id: string; title: string; type: ActivityType; timestamp: string }> = []

    projects.slice(0, 3).forEach((project) => {
      items.push({
        id: `project-${project.id}`,
        title: `Added ${project.name} project`,
        type: 'project',
        timestamp: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently',
      })
    })

    applications.slice(0, 3).forEach((application) => {
      items.push({
        id: `application-${application.id}`,
        title: `Applied to ${application.company}`,
        type: 'application',
        timestamp: application.appliedAt || 'Recently',
      })
    })

    tasks
      .filter((task) => task.status === 'COMPLETED')
      .slice(0, 3)
      .forEach((task) => {
        items.push({
          id: `task-${task.id}`,
          title: `Completed ${task.title}`,
          type: 'task',
          timestamp: task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Recently',
        })
      })

    dsaProgress
      .filter((progress) => progress.status === 'SOLVED' && progress.lastSolvedAt)
      .slice(0, 3)
      .forEach((progress) => {
        const problem = dsaProblems.find((p) => p.id === progress.problemId)
        items.push({
          id: `dsa-${progress.problemId}`,
          title: problem ? `Solved ${problem.title}` : 'Solved a DSA problem',
          type: 'dsa',
          timestamp: progress.lastSolvedAt ? new Date(progress.lastSolvedAt).toLocaleDateString() : 'Recently',
        })
      })

    return items.slice(0, 6)
  }, [applications, dsaProblems, dsaProgress, projects, tasks])

  return (
    <Card className="p-5">
      <SectionHeader title="Recent Activity" subtitle="Your latest moves" />

      {activities.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No recent activity yet.</p>
      ) : (
        <ul className="mt-4">
          {activities.map((activity, index) => {
            const config = activityIcon[activity.type]
            const Icon = config.icon
            return (
              <li
                key={activity.id}
                className="relative flex items-center gap-3 py-3"
              >
                {index < activities.length - 1 ? (
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
      )}
    </Card>
  )
}