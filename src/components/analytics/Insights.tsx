import { useMemo } from 'react'
import { CheckCircle2, CircleAlert, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '../Card'
import { SectionHeader } from '../SectionHeader'
import { useAppStore } from '../../store/useAppStore'
import { generateInsights } from '../../lib/analytics'
import type { InsightTone } from '../../lib/analytics'
import { cn } from '../../lib/cn'

const TONE_META: Record<InsightTone, { icon: LucideIcon; tile: string }> = {
  info: { icon: Lightbulb, tile: 'bg-sky-50 text-sky-600' },
  success: { icon: CheckCircle2, tile: 'bg-emerald-50 text-emerald-600' },
  warning: { icon: CircleAlert, tile: 'bg-amber-50 text-amber-600' },
}

export function Insights() {
  const dsaProblems = useAppStore((s) => s.dsaProblems)
  const dsaProgress = useAppStore((s) => s.dsaProgress)
  const applications = useAppStore((s) => s.applications)
  const tasks = useAppStore((s) => s.tasks)
  const projects = useAppStore((s) => s.projects)

  const insights = useMemo(
    () =>
      generateInsights({
        dsaProblems,
        dsaProgress,
        applications,
        tasks,
        projects,
      }),
    [dsaProblems, dsaProgress, applications, tasks, projects],
  )

  if (insights.length === 0) return null

  return (
    <section aria-label="Insights">
      <Card className="p-5">
        <SectionHeader
          title="Insights"
          subtitle="Rule-based guidance derived from your current data"
        />
        <ul className="mt-4 space-y-3">
          {insights.map((insight) => {
            const meta = TONE_META[insight.tone]
            const Icon = meta.icon
            return (
              <li
                key={insight.id}
                className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 px-3.5 py-3"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    meta.tile,
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <p className="text-sm leading-relaxed text-neutral-700">{insight.message}</p>
              </li>
            )
          })}
        </ul>
      </Card>
    </section>
  )
}