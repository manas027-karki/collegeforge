import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Target,
} from 'lucide-react'
import { StatCard } from '../StatCard'
import type { StudyStats } from './studyStatsUtils'

export function StudyStats({ stats }: { stats: StudyStats }) {
  return (
    <section
      aria-label="Study statistics"
      className="grid grid-cols-2 gap-4 xl:grid-cols-4"
    >
      <StatCard
        label="Today's Tasks"
        value={stats.today}
        description="Due today"
        icon={CalendarCheck}
        tone="primary"
      />
      <StatCard
        label="This Week"
        value={stats.week}
        description="Due this week"
        icon={CalendarDays}
        tone="blue"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        description="Tasks completed"
        icon={CheckCircle2}
        tone="green"
      />
      <StatCard
        label="Completion Rate"
        value={`${stats.completionRate}%`}
        description="Completed of total"
        icon={Target}
        tone="purple"
      />
    </section>
  )
}