import { useMemo } from 'react'
import { Inbox } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../Card'
import { SectionHeader } from '../SectionHeader'
import { ProgressBar } from '../ProgressBar'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from '../applications/applicationMeta'
import { EmptyAnalytics } from './EmptyAnalytics'
import { useAppStore } from '../../store/useAppStore'
import {
  calculateInterviewRate,
  calculateSelectionRate,
  calculateStatusDistribution,
  displayPercentage,
  filterByTimeRange,
  getTimeRangeLabel,
} from '../../lib/analytics'
import type { TimeRange } from '../../lib/analytics'
import type { ApplicationStatus } from '../../types'

const STATUS_HEX: Record<ApplicationStatus, string> = {
  SAVED: '#a1a1aa',
  APPLIED: '#0ea5e9',
  OA: '#f59e0b',
  INTERVIEW: '#8b5cf6',
  SELECTED: '#10b981',
  REJECTED: '#f43f5e',
}

interface ApplicationAnalyticsProps {
  range: TimeRange
}

interface FunnelPoint {
  status: string
  value: number
  color: string
}

function FunnelTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: FunnelPoint }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-neutral-500">{point.status}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-neutral-900">
        {point.value} applications
      </p>
    </div>
  )
}

function SliceTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number | string }>
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-neutral-500">{entry.name}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-neutral-900">
        {entry.value ?? 0} applications
      </p>
    </div>
  )
}

export function ApplicationAnalytics({ range }: ApplicationAnalyticsProps) {
  const applications = useAppStore((s) => s.applications)

  const rangedApplications = useMemo(
    () => filterByTimeRange(applications, (app) => app.appliedAt, range),
    [applications, range],
  )

  const distribution = useMemo(
    () => calculateStatusDistribution(rangedApplications, APPLICATION_STATUSES),
    [rangedApplications],
  )

  const total = rangedApplications.length

  const funnel: FunnelPoint[] = APPLICATION_STATUSES.map((status) => ({
    status: APPLICATION_STATUS_LABELS[status],
    value: distribution[status],
    color: STATUS_HEX[status],
  }))

  if (applications.length === 0 || total === 0) {
    return (
      <section aria-label="Application analytics" className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          Application Analytics
        </h2>
        <EmptyAnalytics
          icon={Inbox}
          title={
            applications.length === 0
              ? 'No application data yet'
              : 'No applications in this range'
          }
          description={
            applications.length === 0
              ? 'Add applications to start tracking your job search analytics.'
              : 'No applications were recorded in the selected time range. Try a wider range such as All Time.'
          }
        />
      </section>
    )
  }

  const interviewRate = calculateInterviewRate(distribution.INTERVIEW, total)
  const selectionRate = calculateSelectionRate(distribution.SELECTED, total)

  return (
    <section aria-label="Application analytics" className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        Application Analytics
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col p-5 lg:col-span-2">
          <SectionHeader
            title="Application Pipeline"
            subtitle={`Applications by stage · ${getTimeRangeLabel(range)}`}
          />
          <div className="mt-5 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnel}
                layout="vertical"
                margin={{ top: 4, right: 40, bottom: 0, left: 0 }}
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
                  dataKey="status"
                  width={80}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#525252' }}
                />
                <Tooltip cursor={{ fill: '#fafafa' }} content={<FunnelTooltip />} />
                <Bar dataKey="value" name="Applications" radius={[0, 4, 4, 0]} barSize={22}>
                  {funnel.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    style={{ fontSize: 12, fill: '#525252', fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-1 flex-col p-5">
            <SectionHeader
              title="Status Distribution"
              subtitle="Share of all applications"
            />
            <div className="relative mx-auto mt-4 h-[180px] w-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funnel}
                    dataKey="value"
                    nameKey="status"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={2}
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {funnel.map((entry) => (
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
                <span className="text-xs text-neutral-500">apps</span>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {funnel.map((entry) => (
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

          <Card className="p-5">
            <SectionHeader title="Conversion Rates" subtitle="Selected range only" />
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Interview Rate
                  </span>
                  <span className="text-base font-semibold tabular-nums text-neutral-900">
                    {displayPercentage(interviewRate)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {distribution.INTERVIEW} of {total} applications
                </p>
                <div className="mt-2">
                  <ProgressBar
                    value={distribution.INTERVIEW}
                    total={total}
                    tone="primary"
                    suffix="apps"
                    showLabel={false}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Selection Rate
                  </span>
                  <span className="text-base font-semibold tabular-nums text-neutral-900">
                    {displayPercentage(selectionRate)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {distribution.SELECTED} of {total} applications
                </p>
                <div className="mt-2">
                  <ProgressBar
                    value={distribution.SELECTED}
                    total={total}
                    tone="green"
                    suffix="apps"
                    showLabel={false}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}