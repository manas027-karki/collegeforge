import {
  Binary,
  CalendarCheck,
  FolderKanban,
  Inbox,
} from 'lucide-react'
import { ApplicationPipeline } from '../components/ApplicationPipeline'
import { DeadlineList } from '../components/DeadlineList'
import { DsaProgressCard } from '../components/DsaProgressCard'
import { RecentActivity } from '../components/RecentActivity'
import { StatCard } from '../components/StatCard'
import { useAppStore } from '../store/useAppStore'

export function Dashboard() {
  const stats = useAppStore((s) => s.dashboardStats)
  const profile = useAppStore((s) => s.profile)
  const firstName = profile.fullName.trim().split(/\s+/)[0] || profile.fullName

  return (
    <div className="space-y-6">
      <section aria-labelledby="dashboard-greeting">
        <h1
          id="dashboard-greeting"
          className="text-2xl font-semibold tracking-tight text-neutral-900"
        >
          Good evening, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s your career progress today.
        </p>
      </section>

      <section aria-label="Key statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="DSA Problems"
            value={stats.dsaProblems}
            description="Problems solved"
            icon={Binary}
            tone="primary"
            delta="+12 this month"
          />
          <StatCard
            label="Applications"
            value={stats.applications}
            description="Active applications"
            icon={Inbox}
            tone="blue"
            delta="+6 this week"
          />
          <StatCard
            label="Interviews"
            value={stats.interviews}
            description="Scheduled"
            icon={CalendarCheck}
            tone="amber"
          />
          <StatCard
            label="Projects"
            value={stats.projects}
            description="Completed"
            icon={FolderKanban}
            tone="green"
          />
        </div>
      </section>

      <DsaProgressCard />

      <ApplicationPipeline />

      <section aria-label="Deadlines and activity">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DeadlineList />
          <RecentActivity />
        </div>
      </section>
    </div>
  )
}