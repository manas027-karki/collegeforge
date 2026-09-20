import { ArrowRight, TrendingUp } from 'lucide-react'
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
import { mockData } from '../data/mockData'
import { Card } from './Card'
import { ProgressBar } from './ProgressBar'
import { SectionHeader } from './SectionHeader'

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
  const { dsaStats } = mockData

  return (
    <Card className="p-5">
      <SectionHeader
        title="DSA Progress"
        subtitle={`${dsaStats.total} of ${dsaStats.goal} problems solved`}
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
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />
              +12% this month
            </span>
          </div>
          <div className="mt-3 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dsaStats.monthly}
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
            <ProgressBar label="Easy" value={dsaStats.easy} total={dsaStats.total} tone="green" />
            <ProgressBar label="Medium" value={dsaStats.medium} total={dsaStats.total} tone="amber" />
            <ProgressBar label="Hard" value={dsaStats.hard} total={dsaStats.total} tone="red" />
          </div>
          <div className="mt-5 rounded-lg bg-neutral-50 px-4 py-3 ring-1 ring-inset ring-neutral-200">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-neutral-600">Total solved</span>
              <span className="text-lg font-semibold tabular-nums tracking-tight text-neutral-900">
                {dsaStats.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}