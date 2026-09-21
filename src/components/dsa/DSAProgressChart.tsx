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

interface SolvedPoint {
  month: string
  solved: number
}

interface DSAProgressChartProps {
  data: SolvedPoint[]
}

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

export function DSAProgressChart({ data }: DSAProgressChartProps) {
  return (
    <Card className="flex flex-col p-5 lg:col-span-2">
      <SectionHeader
        title="Problems solved over time"
        subtitle="Cumulative solved problems by month"
      />
      <div className="mt-5 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="dsaSolvedFill" x1="0" y1="0" x2="0" y2="1">
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
              width={36}
              tick={{ fontSize: 12, fill: '#737373' }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="solved"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#dsaSolvedFill)"
              dot={{ r: 2, fill: '#6366f1', strokeWidth: 0 }}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#4f46e5' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}