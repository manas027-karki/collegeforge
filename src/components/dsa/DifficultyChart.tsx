import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../Card'
import { SectionHeader } from '../SectionHeader'
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, DIFFICULTY_ORDER } from './dsaMeta'
import type { DSAStatsData } from './dsaStatsUtils'

interface DifficultyChartProps {
  stats: DSAStatsData
}

function ChartTooltip({
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
      <p className="font-semibold tabular-nums text-neutral-900">
        {entry.value ?? 0} solved
      </p>
    </div>
  )
}

export function DifficultyChart({ stats }: DifficultyChartProps) {
  const data = DIFFICULTY_ORDER.map((difficulty) => ({
    name: DIFFICULTY_LABELS[difficulty],
    value: stats.solvedByDifficulty[difficulty],
    color: DIFFICULTY_COLORS[difficulty],
  }))

  return (
    <Card className="p-5">
      <SectionHeader
        title="Solved by difficulty"
        subtitle="Difficulty breakdown"
      />

      <div className="relative mx-auto mt-4 h-[200px] w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              strokeWidth={2}
              stroke="#ffffff"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-900">
            {stats.totalSolved}
          </span>
          <span className="text-xs text-neutral-500">solved</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-neutral-600">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-medium tabular-nums text-neutral-900">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}