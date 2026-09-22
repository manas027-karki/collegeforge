import { Archive, BadgeCheck, FileText, Layers } from 'lucide-react'
import { StatCard } from '../StatCard'
import type { ResumeStatsData } from './resumeFilter'

interface ResumeStatsProps {
  stats: ResumeStatsData
}

export function ResumeStats({ stats }: ResumeStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={FileText}
        tone="primary"
        label="Total Resumes"
        value={stats.total}
        description="In your library"
      />
      <StatCard
        icon={BadgeCheck}
        tone="green"
        label="Current Resume"
        value={stats.currentVersion !== null ? `v${stats.currentVersion}` : '—'}
        description={stats.currentRole}
      />
      <StatCard
        icon={Archive}
        tone="neutral"
        label="Archived"
        value={stats.archived}
        description="Stored versions"
      />
      <StatCard
        icon={Layers}
        tone="purple"
        label="Latest Version"
        value={`v${stats.latestVersion}`}
        description="Highest upload version"
      />
    </div>
  )
}