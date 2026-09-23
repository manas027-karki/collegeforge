import { useMemo } from 'react'
import { FolderKanban } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../Card'
import { SectionHeader } from '../SectionHeader'
import { ProgressBar } from '../ProgressBar'
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from '../projects/projectMeta'
import { EmptyAnalytics } from './EmptyAnalytics'
import { useAppStore } from '../../store/useAppStore'
import {
  calculateCompletionPercentage,
  calculateProjectDistribution,
  displayPercentage,
} from '../../lib/analytics'
import type { ProjectStatus } from '../../types'

const STATUS_HEX: Record<ProjectStatus, string> = {
  PLANNED: '#a1a1aa',
  IN_PROGRESS: '#0ea5e9',
  COMPLETED: '#10b981',
  ARCHIVED: '#f59e0b',
}

interface SlicePoint {
  status: string
  value: number
  color: string
}

function SliceTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: SlicePoint }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-neutral-500">{point.status}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-neutral-900">
        {point.value} projects
      </p>
    </div>
  )
}

export function ProjectAnalytics() {
  const projects = useAppStore((s) => s.projects)

  const distribution = useMemo(
    () => calculateProjectDistribution(projects),
    [projects],
  )

  const sliceData: SlicePoint[] = PROJECT_STATUSES.map((status) => ({
    status: PROJECT_STATUS_LABELS[status],
    value: distribution[status],
    color: STATUS_HEX[status],
  }))

  if (projects.length === 0) {
    return (
      <section aria-label="Project analytics" className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          Project Analytics
        </h2>
        <EmptyAnalytics
          icon={FolderKanban}
          title="No projects yet"
          description="Add projects to start tracking your portfolio progress."
        />
      </section>
    )
  }

  const total = projects.length
  const completed = distribution.COMPLETED
  const projectCompletion = calculateCompletionPercentage(completed, total)

  return (
    <section aria-label="Project analytics" className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        Project Analytics
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col p-5">
          <SectionHeader title="Portfolio Overview" subtitle="Projects across all statuses" />
          <dl className="mt-4 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-sm text-neutral-500">Total Projects</dt>
              <dd className="text-lg font-semibold tabular-nums text-neutral-900">
                {total}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-sm text-neutral-500">Completed</dt>
              <dd className="text-lg font-semibold tabular-nums text-neutral-900">
                {completed}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-sm text-neutral-500">Active</dt>
              <dd className="text-lg font-semibold tabular-nums text-neutral-900">
                {distribution.IN_PROGRESS}
              </dd>
            </div>
          </dl>
          <p className="mt-1 text-xs text-neutral-500">
            Active counts in-progress projects only; archived projects are excluded.
          </p>
          <div className="mt-5">
            <ProgressBar
              label="Project completion"
              value={completed}
              total={total}
              tone="green"
              suffix="complete"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {displayPercentage(projectCompletion)} of your portfolio is complete
            </p>
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <SectionHeader title="Status Distribution" subtitle="Projects by current status" />
          <div className="relative mx-auto mt-4 h-[200px] w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sliceData}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {sliceData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<SliceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-900">
                {total}
              </span>
              <span className="text-xs text-neutral-500">projects</span>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {sliceData.map((entry) => (
              <li key={entry.status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-neutral-600">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.status}
                </span>
                <span className="font-medium tabular-nums text-neutral-900">
                  {entry.value}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}