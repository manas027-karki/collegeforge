import { useMemo } from 'react'
import { Binary } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../Card'
import { SectionHeader } from '../SectionHeader'
import { DifficultyChart } from '../dsa/DifficultyChart'
import { computeDSAStats } from '../dsa/dsaStatsUtils'
import { EmptyAnalytics } from './EmptyAnalytics'
import { useAppStore } from '../../store/useAppStore'
import {
  buildSolvedTimeline,
  calculateCompletionPercentage,
  getTimeRangeLabel,
  displayPercentage,
} from '../../lib/analytics'
import type { TimeRange, SolvedTimelinePoint } from '../../lib/analytics'

interface DSAAnalyticsProps {
  range: TimeRange
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ payload?: SolvedTimelinePoint }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-neutral-500">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-neutral-900">
        {point.solved} total solved
      </p>
      <p className="text-neutral-500 tabular-nums">{point.dayCount} solved that day</p>
    </div>
  )
}

export function DSAAnalytics({ range }: DSAAnalyticsProps) {
  const problems = useAppStore((s) => s.dsaProblems)
  const progress = useAppStore((s) => s.dsaProgress)

  const stats = useMemo(() => computeDSAStats(problems, progress), [problems, progress])
  const timeline = useMemo(
    () => buildSolvedTimeline(progress, range),
    [progress, range],
  )

  if (problems.length === 0) {
    return (
      <section aria-label="DSA analytics" className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          DSA Progress
        </h2>
        <EmptyAnalytics
          icon={Binary}
          title="No DSA data yet"
          description="Start solving problems to see your progress here."
        />
      </section>
    )
  }

  const tickInterval = Math.max(0, Math.ceil(timeline.length / 8) - 1)

  return (
    <section aria-label="DSA analytics" className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
        DSA Progress
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col p-5 lg:col-span-2">
          <SectionHeader
            title="Problems Solved"
            subtitle={`Cumulative solves · ${getTimeRangeLabel(range)}`}
          />
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums tracking-tight text-neutral-900">
              {stats.totalSolved}
            </span>
            <span className="text-sm text-neutral-500">
              solved · {displayPercentage(calculateCompletionPercentage(stats.totalSolved, stats.total))} completion
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-10 text-center">
              <p className="text-sm font-medium text-neutral-700">
                No solve history in this range
              </p>
              <p className="mt-1 max-w-xs text-xs text-neutral-500">
                Recorded solves fall outside the selected time range. Try a wider range
                such as All Time.
              </p>
            </div>
          ) : (
            <div className="mt-4 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="analyticsDsaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="label"
                    interval={tickInterval}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#737373' }}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="solved"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#analyticsDsaFill)"
                    dot={{ r: 2, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#4f46e5' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <DifficultyChart stats={stats} />
      </div>
    </section>
  )
}