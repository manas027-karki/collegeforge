import { useMemo } from 'react'
import {
  Activity,
  Binary,
  CalendarCheck,
  CheckCircle2,
  FolderKanban,
  Inbox,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { StatCard } from '../StatCard'
import { APPLICATION_STATUSES } from '../applications/applicationMeta'
import { computeDSAStats } from '../dsa/dsaStatsUtils'
import { useAppStore } from '../../store/useAppStore'
import {
  calculateCompletionPercentage,
  calculateProjectDistribution,
  calculateStatusDistribution,
  calculateStudyCompletion,
  displayPercentage,
} from '../../lib/analytics'

export function AnalyticsStats() {
  const dsaProblems = useAppStore((s) => s.dsaProblems)
  const dsaProgress = useAppStore((s) => s.dsaProgress)
  const applications = useAppStore((s) => s.applications)
  const projects = useAppStore((s) => s.projects)
  const tasks = useAppStore((s) => s.tasks)

  const dsa = useMemo(
    () => computeDSAStats(dsaProblems, dsaProgress),
    [dsaProblems, dsaProgress],
  )

  const appDistribution = useMemo(
    () => calculateStatusDistribution(applications, APPLICATION_STATUSES),
    [applications],
  )

  const projectDistribution = useMemo(
    () => calculateProjectDistribution(projects),
    [projects],
  )

  const study = useMemo(() => calculateStudyCompletion(tasks), [tasks])

  const projectCompletion = calculateCompletionPercentage(
    projectDistribution.COMPLETED,
    projects.length,
  )

  return (
    <section aria-label="Analytics statistics" className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          DSA
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Problems"
            value={dsa.total}
            description={`${dsa.totalSolved} solved · ${displayPercentage(calculateCompletionPercentage(dsa.totalSolved, dsa.total))} completion`}
            icon={Binary}
            tone="primary"
          />
          <StatCard
            label="Solved Problems"
            value={dsa.totalSolved}
            description={`${dsa.totalUnsolved} unsolved remaining`}
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            label="Overall Completion"
            value={displayPercentage(calculateCompletionPercentage(dsa.totalSolved, dsa.total))}
            description="Solved of total problems"
            icon={TrendingUp}
            tone="blue"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Applications
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Applications"
            value={applications.length}
            description="Across all statuses"
            icon={Inbox}
            tone="blue"
          />
          <StatCard
            label="Interviews"
            value={appDistribution.INTERVIEW}
            description="In interview stage"
            icon={CalendarCheck}
            tone="amber"
          />
          <StatCard
            label="Selected"
            value={appDistribution.SELECTED}
            description="Offers received"
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            label="Rejected"
            value={appDistribution.REJECTED}
            description="Not selected"
            icon={XCircle}
            tone="red"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Projects
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Projects"
            value={projects.length}
            description="Across all statuses"
            icon={FolderKanban}
            tone="primary"
          />
          <StatCard
            label="Completed Projects"
            value={projectDistribution.COMPLETED}
            description={`${displayPercentage(projectCompletion)} of portfolio`}
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            label="In Progress"
            value={projectDistribution.IN_PROGRESS}
            description="Currently active"
            icon={Activity}
            tone="blue"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Study
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Tasks"
            value={study.total}
            description="All study tasks"
            icon={CalendarCheck}
            tone="primary"
          />
          <StatCard
            label="Completed Tasks"
            value={study.completed}
            description={`${study.pending} still pending`}
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            label="Completion"
            value={displayPercentage(study.percentage)}
            description={`${study.completed} of ${study.total} tasks`}
            icon={TrendingUp}
            tone="blue"
          />
        </div>
      </div>
    </section>
  )
}