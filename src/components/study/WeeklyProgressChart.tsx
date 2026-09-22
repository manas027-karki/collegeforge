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
import type { WeeklyPoint } from './studyStatsUtils'

export function WeeklyProgressChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <Card className="flex flex-col p-5">
      <SectionHeader
        title="Weekly progress"
        subtitle="Tasks scheduled and completed this week"
      />
      <div className="mt-5 h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
            <Tooltip
              cursor={{ fill: '#fafafa' }}
              content={(props) => {
                const { active, payload } = props
                if (!active || !payload?.length) return null
                const point = payload[0]?.payload as WeeklyPoint | undefined
                return (
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
                    <p className="font-medium text-neutral-500">{point?.day}</p>
                    <p className="mt-0.5 font-semibold tabular-nums text-neutral-900">
                      {point?.completed ?? 0} completed
                    </p>
                    <p className="text-neutral-500 tabular-nums">
                      {point?.scheduled ?? 0} scheduled
                    </p>
                  </div>
                )
              }}
            />
            <Bar
              dataKey="scheduled"
              name="Scheduled"
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
  )
}