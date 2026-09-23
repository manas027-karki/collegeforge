import { useMemo } from 'react'
import { Binary, CalendarCheck, FileText, FolderKanban, Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '../Card'
import { SectionHeader } from '../SectionHeader'
import { APPLICATION_STATUS_LABELS } from '../applications/applicationMeta'
import { useAppStore } from '../../store/useAppStore'
import {
  filterByTimeRange,
  getTimeRangeLabel,
  isWithinTimeRange,
} from '../../lib/analytics'
import type { TimeRange } from '../../lib/analytics'
import { formatShortDate } from '../../lib/dates'

type ActivityType = 'dsa' | 'application' | 'project' | 'resume'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  caption: string
  date: string
}

interface AggregateRow {
  label: string
  value: number
  icon: LucideIcon
}

const ACTIVITY_META: Record<ActivityType, { icon: LucideIcon; tile: string }> = {
  dsa: { icon: Binary, tile: 'bg-primary-50 text-primary-600' },
  application: { icon: Inbox, tile: 'bg-sky-50 text-sky-600' },
  project: { icon: FolderKanban, tile: 'bg-emerald-50 text-emerald-600' },
  resume: { icon: FileText, tile: 'bg-violet-50 text-violet-600' },
}

interface ActivityOverviewProps {
  range: TimeRange
}

export function ActivityOverview({ range }: ActivityOverviewProps) {
  const dsaProblems = useAppStore((s) => s.dsaProblems)
  const dsaProgress = useAppStore((s) => s.dsaProgress)
  const applications = useAppStore((s) => s.applications)
  const projects = useAppStore((s) => s.projects)
  const tasks = useAppStore((s) => s.tasks)
  const resumes = useAppStore((s) => s.resumes)

  const problemById = useMemo(
    () => new Map(dsaProblems.map((problem) => [problem.id, problem.title])),
    [dsaProblems],
  )

  const aggregateRows: AggregateRow[] = useMemo(() => {
    const solvedInRange = dsaProgress.filter(
      (item) => item.status === 'SOLVED' && isWithinTimeRange(item.lastSolvedAt, range),
    ).length
    const applicationsInRange = applications.filter((app) =>
      isWithinTimeRange(app.appliedAt, range),
    ).length
    const studyCompletedInRange = filterByTimeRange(tasks, (task) => task.dueDate, range)
      .filter((task) => task.status === 'COMPLETED').length
    const projectsCompletedInRange = projects.filter(
      (project) =>
        project.status === 'COMPLETED' &&
        isWithinTimeRange(project.endDate ?? project.updatedAt, range),
    ).length
    const resumeUpdatesInRange = resumes.filter(
      (resume) => isWithinTimeRange(resume.updatedAt, range),
    ).length

    return [
      {
        label: 'DSA Problems Solved',
        value: solvedInRange,
        icon: Binary,
      },
      {
        label: 'Applications Submitted',
        value: applicationsInRange,
        icon: Inbox,
      },
      {
        label: 'Study Tasks Completed',
        value: studyCompletedInRange,
        icon: CalendarCheck,
      },
      {
        label: 'Projects Completed',
        value: projectsCompletedInRange,
        icon: FolderKanban,
      },
      {
        label: 'Resume Updates',
        value: resumeUpdatesInRange,
        icon: FileText,
      },
    ]
  }, [dsaProgress, applications, tasks, projects, resumes, range])

  const timeline = useMemo(() => {
    const items: ActivityItem[] = []

    for (const application of applications) {
      if (isWithinTimeRange(application.appliedAt, range)) {
        items.push({
          id: `app-${application.id}`,
          type: 'application',
          title: `${application.company} — ${application.role}`,
          caption: `Application · ${APPLICATION_STATUS_LABELS[application.status]}`,
          date: application.appliedAt,
        })
      }
    }

    for (const item of dsaProgress) {
      if (item.status === 'SOLVED' && isWithinTimeRange(item.lastSolvedAt, range)) {
        const title = problemById.get(item.problemId) ?? 'Unknown problem'
        items.push({
          id: `dsa-${item.problemId}`,
          type: 'dsa',
          title: `Solved ${title}`,
          caption: 'DSA',
          date: item.lastSolvedAt ?? '',
        })
      }
    }

    for (const project of projects) {
      if (project.status === 'COMPLETED') {
        const completionDate = project.endDate ?? project.updatedAt
        if (isWithinTimeRange(completionDate, range)) {
          items.push({
            id: `proj-${project.id}`,
            type: 'project',
            title: `Completed ${project.name}`,
            caption: 'Project',
            date: completionDate,
          })
        }
      }
    }

    for (const resume of resumes) {
      if (isWithinTimeRange(resume.updatedAt, range)) {
        items.push({
          id: `resume-${resume.id}`,
          type: 'resume',
          title: `${resume.targetRole} resume v${resume.version}`,
          caption: 'Resume update',
          date: resume.updatedAt,
        })
      }
    }

    return items
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12)
  }, [applications, dsaProgress, projects, resumes, range, problemById])

  return (
    <section aria-label="Career activity" className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        Activity Overview
      </h2>

      <Card className="p-5">
        <SectionHeader
          title="Career Activity"
          subtitle={`Activity within ${getTimeRangeLabel(range)} · based on recorded timestamps`}
        />

        <div className="mt-5 grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {aggregateRows.map((row) => {
              const Icon = row.icon
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">
                    {row.label}
                  </span>
                  <span className="text-base font-semibold tabular-nums text-neutral-900">
                    {row.value}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-3 lg:border-l lg:border-neutral-200 lg:pl-6">
            {timeline.length === 0 ? (
              <p className="py-2 text-sm text-neutral-500">
                No recorded activity in this time range. Try widening the range to see
                recent updates.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {timeline.map((item) => {
                  const meta = ACTIVITY_META[item.type]
                  const Icon = meta.icon
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <span
                        className={[
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          meta.tile,
                        ].join(' ')}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-neutral-500">{item.caption}</p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-neutral-500">
                        {formatShortDate(item.date)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </section>
  )
}