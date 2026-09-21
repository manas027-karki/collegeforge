import { CheckCircle2, Flame, Gauge, ListChecks, Zap } from 'lucide-react'
import { StatCard } from '../StatCard'
import type { DSAStatsData } from './dsaStatsUtils'

interface DSAStatsProps {
  stats: DSAStatsData
}

export function DSAStats({ stats }: DSAStatsProps) {
  return (
    <section
      aria-label="DSA statistics"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5"
    >
      <StatCard
        label="Total Solved"
        value={stats.totalSolved}
        description="Solved problems"
        icon={CheckCircle2}
        tone="green"
      />
      <StatCard
        label="Easy"
        value={stats.solvedByDifficulty.EASY}
        description="Easy solved"
        icon={Zap}
        tone="green"
      />
      <StatCard
        label="Medium"
        value={stats.solvedByDifficulty.MEDIUM}
        description="Medium solved"
        icon={Gauge}
        tone="amber"
      />
      <StatCard
        label="Hard"
        value={stats.solvedByDifficulty.HARD}
        description="Hard solved"
        icon={Flame}
        tone="red"
      />
      <StatCard
        label="Total Problems"
        value={stats.total}
        description="In tracker"
        icon={ListChecks}
        tone="primary"
      />
    </section>
  )
}