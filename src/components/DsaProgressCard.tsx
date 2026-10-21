import { ArrowRight, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { computeDSAStats } from './dsa/dsaStatsUtils'
import { buildMonthlySolvedSeries } from '../lib/analytics'
import { useAppStore } from '../store/useAppStore'
import { Card } from './Card'
import { ProgressBar } from './ProgressBar'
import { SectionHeader } from './SectionHeader'

/**
 * The user's own target. Not a statistic, so it is not stored anywhere.
 */
const DSA_GOAL = 200

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-neutral-500">{label}</p>
      <p className="font-semibold tabular-nums text-neutral-900">
        {payload[0]?.value ?? 0} solved
      </p>
    </div>
  )
}

export function DsaProgressCard() {
  const problems = useAppStore((s) => s.dsaProblems)
  const progress = useAppStore((s) => s.dsaProgress)

  const stats = useMemo(
    () => computeDSAStats(problems, progress),
    [problems, progress],
  )
  const monthly = useMemo(
    () => buildMonthlySolvedSeries(progress),
    [progress],
  )

  // The change in the number solved between the last two months. Left out
  // entirely when there is not enough history to compare, rather than showing
  // a made-up percentage.
  const monthChange = useMemo(() => {
    if (monthly.length < 2) return null

    const last = monthly[monthly.length - 1].solved
    const previous = monthly[monthly.length - 2].solved
    const delta = last - previous

    if (delta === 0) return null

    return {
      value: delta,
      percent: previous === 0 ? 100 : Math.round((delta / previous) * 100),
      up: delta > 0,
    }
  }, [monthly])

  return (
    <Card className="p-5">
      <SectionHeader
        title="DSA Progress"
        subtitle={`${stats.totalSolved} of ${DSA_GOAL} problems solved`}
        action={
          <Link
            to="/dsa"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View tracker
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        }
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">
              Problems solved over time
            </p>
            {monthChange ? (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  monthChange.up ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                <TrendingUp
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 ${monthChange.up ? '' : 'rotate-180'}`}
                />
                {monthChange.up ? '+' : ''}
                {monthChange.percent}% this month
              </span>
            ) : null}
          </div>
          <div className="mt-3 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthly}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="dsaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#737373' }}
                  dy={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 12, fill: '#737373' }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="solved"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#dsaFill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#4f46e5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-700">Difficulty breakdown</p>
          <div className="mt-3 space-y-4">
            <ProgressBar
              label="Easy"
              value={stats.solvedByDifficulty.EASY}
              total={stats.totalSolved}
              tone="green"
            />
            <ProgressBar
              label="Medium"
              value={stats.solvedByDifficulty.MEDIUM}
              total={stats.totalSolved}
              tone="amber"
            />
            <ProgressBar
              label="Hard"
              value={stats.solvedByDifficulty.HARD}
              total={stats.totalSolved}
              tone="red"
            />
          </div>
          <div className="mt-5 rounded-lg bg-neutral-50 px-4 py-3 ring-1 ring-inset ring-neutral-200">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-neutral-600">Total solved</span>
              <span className="text-lg font-semibold tabular-nums tracking-tight text-neutral-900">
                {stats.totalSolved}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}