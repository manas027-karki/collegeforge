import { useState } from 'react'
import { ActivityOverview } from '../components/analytics/ActivityOverview'
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader'
import { AnalyticsStats } from '../components/analytics/AnalyticsStats'
import { ApplicationAnalytics } from '../components/analytics/ApplicationAnalytics'
import { DSAAnalytics } from '../components/analytics/DSAAnalytics'
import { Insights } from '../components/analytics/Insights'
import { ProjectAnalytics } from '../components/analytics/ProjectAnalytics'
import { ResumeAnalytics } from '../components/analytics/ResumeAnalytics'
import { StudyAnalytics } from '../components/analytics/StudyAnalytics'
import type { TimeRange } from '../lib/analytics'

export function Analytics() {
  const [range, setRange] = useState<TimeRange>('30d')

  return (
    <div className="space-y-6">
      <AnalyticsHeader range={range} onRangeChange={setRange} />

      <AnalyticsStats />

      <DSAAnalytics range={range} />

      <ApplicationAnalytics range={range} />

      <StudyAnalytics range={range} />

      <ProjectAnalytics />

      <ResumeAnalytics />

      <ActivityOverview range={range} />

      <Insights />
    </div>
  )
}