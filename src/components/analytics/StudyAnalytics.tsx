import { useMemo } from 'react'
import { CalendarCheck } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../Card'
import { SectionHeader } from '../SectionHeader'
import { ProgressBar } from '../ProgressBar'
import { EmptyAnalytics } from './EmptyAnalytics'
import { useAppStore } from '../../store/useAppStore'
import {
  calculateCategoryDistribution,
  calculateStudyCompletion,
  filterByTimeRange,
  getTimeRangeLabel,
  groupByWeek,
} from '../../lib/analytics'
import type { TimeRange, WeekActivityPoint, CategoryCount } from '../../lib/analytics'

interface StudyAnalyticsProps {
  range: TimeRange
}

function WeeklyTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: WeekActivityPoint }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-neutral-500">{point.day}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-neutral-900">
        {point.completed} completed
      </p>
      <p className="text-neutral-500 tabular-nums">{point.pending} pending</p>
    </div>
  )
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: CategoryCount }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-neutral-500">{point.category}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-neutral-900">
        {point.count} tasks
      </p>
    </div>
  )
}

export function StudyAnalytics({ range }: StudyAnalyticsProps) {
  const tasks = useAppStore((s) => s.tasks)

  const rangedTasks = useMemo(
    () => filterByTimeRange(tasks, (task) => task.dueDate, range),
    [tasks, range],
  )

  const completion = useMemo(
    () => calculateStudyCompletion(rangedTasks),
    [rangedTasks],
  )

  const weekly = useMemo(() => groupByWeek(rangedTasks), [rangedTasks])

  const categories = useMemo(
    () => calculateCategoryDistribution(rangedTasks),
    [rangedTasks],
  )

  if (tasks.length === 0 || rangedTasks.length === 0) {
    return (
      <section aria-label="Study analytics" className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          Study Analytics
        </h2>
        <EmptyAnalytics
          icon={CalendarCheck}
          title={
            tasks.length === 0
              ? 'No study activity yet'
              : 'No study activity in this range'
          }
          description={
            tasks.length === 0
              ? 'Create study tasks to track your consistency.'
              : 'No tasks are recorded in the selected time range. Try a wider range such as All Time.'
          }
        />
      </section>
    )
  }

  const statisticRows = [
    { label: 'Total Tasks', value: completion.total },
    { label: 'Completed', value: completion.completed },
    { label: 'Pending', value: completion.pending },
    { label: 'Completion', value: `${Math.round(completion.percentage)}%` },
  ]

  return (
    <section aria-label="Study analytics" className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        Study Analytics
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col p-5">
          <SectionHeader
            title="Task Completion"
            subtitle={`Tasks due · ${getTimeRangeLabel(range)}`}
          />
          <dl className="mt-4 space-y-3">
            {statisticRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-2">
                <dt className="text-sm text-neutral-500">{row.label}</dt>
                <dd className="text-base font-semibold tabular-nums text-neutral-900">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            <ProgressBar
              label="Completion rate"
              value={completion.completed}
              total={completion.total}
              tone="primary"
              suffix="done"
            />
          </div>
        </Card>

        <Card className="flex flex-col p-5 lg:col-span-2">
          <SectionHeader
            title="Study Activity"
            subtitle="Tasks by weekday · based on due dates"
          />
          <div className="mt-5 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekly}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                barGap={2}
              >
                <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="4 4" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#737373' }}
                  dy={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#737373' }}
                />
                <Tooltip cursor={{ fill: '#fafafa' }} content={<WeeklyTooltip />} />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill="#e5e5e5"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#6366f1"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col p-5 lg:col-span-3">
          <SectionHeader
            title="Category Distribution"
            subtitle="Tasks grouped by category within the selected range"
          />
          <div className="mt-5 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 0, left: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#e5e5e5" strokeDasharray="4 4" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#737373' }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={130}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#525252' }}
                />
                <Tooltip cursor={{ fill: '#fafafa' }} content={<CategoryTooltip />} />
                <Bar
                  dataKey="count"
                  name="Tasks"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </section>
  )
}