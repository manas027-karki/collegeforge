import { TODAY_ISO, formatShortDate } from './dates'
import type {
  Application,
  Difficulty,
  DSAProblem,
  DSAProgress,
  Project,
  ProjectStatus,
  StudyTask,
} from '../types'

export type TimeRange = '7d' | '30d' | '90d' | 'all'

export const TIME_RANGE_OPTIONS: ReadonlyArray<{ value: TimeRange; label: string }> = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
]

export function getTimeRangeLabel(range: TimeRange): string {
  return TIME_RANGE_OPTIONS.find((option) => option.value === range)?.label ?? 'All Time'
}

const RANGE_DAYS: Record<Exclude<TimeRange, 'all'>, number> = {
  '7d': 6,
  '30d': 29,
  '90d': 89,
}

function parseIsoDate(dateIso: string | null | undefined): Date | null {
  if (!dateIso) return null
  const date = new Date(`${dateIso}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function addDays(dateIso: string, days: number): string {
  const date = parseIsoDate(dateIso)
  if (!date) return dateIso
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

export function getTimeRangeStart(
  range: TimeRange,
  todayIso: string = TODAY_ISO,
): string | null {
  if (range === 'all') return null
  return addDays(todayIso, -RANGE_DAYS[range])
}

export function isWithinTimeRange(
  dateIso: string | null | undefined,
  range: TimeRange,
  todayIso: string = TODAY_ISO,
): boolean {
  if (range === 'all') return true
  const date = parseIsoDate(dateIso)
  const start = parseIsoDate(getTimeRangeStart(range, todayIso))
  const today = parseIsoDate(todayIso)
  if (!date || !start || !today) return false
  return date >= start && date <= today
}

export function filterByTimeRange<T>(
  items: readonly T[],
  getDate: (item: T) => string | null | undefined,
  range: TimeRange,
  todayIso: string = TODAY_ISO,
): T[] {
  return items.filter((item) => isWithinTimeRange(getDate(item), range, todayIso))
}

export function displayPercentage(value: number): string {
  return `${Math.round(value * 10) / 10}%`
}

export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((completed / total) * 1000) / 10
}

export function calculateInterviewRate(
  interviewCount: number,
  totalApplications: number,
): number {
  return calculateCompletionPercentage(interviewCount, totalApplications)
}

export function calculateSelectionRate(
  selectedCount: number,
  totalApplications: number,
): number {
  return calculateCompletionPercentage(selectedCount, totalApplications)
}

export function calculateStatusDistribution<T extends string>(
  items: ReadonlyArray<{ status: T }>,
  order: readonly T[],
): Record<T, number> {
  const distribution = Object.fromEntries(
    order.map((status) => [status, 0]),
  ) as Record<T, number>
  for (const item of items) {
    if (item.status in distribution) distribution[item.status] += 1
  }
  return distribution
}

export function calculateDifficultyDistribution(
  problems: readonly DSAProblem[],
  progress: readonly DSAProgress[],
): Record<Difficulty, number> {
  const statusByProblem = new Map(progress.map((item) => [item.problemId, item.status]))
  const distribution: Record<Difficulty, number> = { EASY: 0, MEDIUM: 0, HARD: 0 }
  for (const problem of problems) {
    const status = statusByProblem.get(problem.id) ?? 'UNSOLVED'
    if (status === 'SOLVED') distribution[problem.difficulty] += 1
  }
  return distribution
}

export function calculateProjectDistribution(
  projects: readonly Project[],
): Record<ProjectStatus, number> {
  const distribution: Record<ProjectStatus, number> = {
    PLANNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    ARCHIVED: 0,
  }
  for (const project of projects) distribution[project.status] += 1
  return distribution
}

export interface StudyCompletion {
  total: number
  completed: number
  pending: number
  percentage: number
}

export function calculateStudyCompletion(tasks: readonly StudyTask[]): StudyCompletion {
  const completed = tasks.filter((task) => task.status === 'COMPLETED').length
  const total = tasks.length
  return {
    total,
    completed,
    pending: total - completed,
    percentage: calculateCompletionPercentage(completed, total),
  }
}

export interface DateCountPoint {
  date: string
  count: number
}

export function groupByDate(dates: ReadonlyArray<string | null | undefined>): DateCountPoint[] {
  const counts = new Map<string, number>()
  for (const dateIso of dates) {
    const parsed = parseIsoDate(dateIso)
    if (!parsed) continue
    const key = toIsoDate(parsed)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export interface SolvedTimelinePoint {
  date: string
  label: string
  dayCount: number
  solved: number
}

export function buildSolvedTimeline(
  progress: readonly DSAProgress[],
  range: TimeRange,
  todayIso: string = TODAY_ISO,
): SolvedTimelinePoint[] {
  const solves = progress
    .filter((item) => item.status === 'SOLVED')
    .map((item) => item.lastSolvedAt)

  const inRange =
    range === 'all'
      ? solves.filter((date) => parseIsoDate(date) !== null)
      : solves.filter((date) => isWithinTimeRange(date, range, todayIso))

  if (inRange.length === 0) return []

  const startIso = getTimeRangeStart(range, todayIso)
  const start = parseIsoDate(startIso)
  let baseline = 0
  if (start) {
    baseline = solves.filter((date) => {
      const parsed = parseIsoDate(date)
      return parsed !== null && parsed < start
    }).length
  }

  let cumulative = baseline
  return groupByDate(inRange).map((point) => {
    cumulative += point.count
    return {
      date: point.date,
      label: formatShortDate(point.date),
      dayCount: point.count,
      solved: cumulative,
    }
  })
}

export interface WeekActivityPoint {
  day: string
  completed: number
  pending: number
  total: number
}

export function groupByWeek(tasks: readonly StudyTask[]): WeekActivityPoint[] {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const points: WeekActivityPoint[] = weekdays.map((day) => ({
    day,
    completed: 0,
    pending: 0,
    total: 0,
  }))

  for (const task of tasks) {
    const date = parseIsoDate(task.dueDate)
    if (!date) continue
    const index = (date.getDay() + 6) % 7
    const point = points[index]
    if (!point) continue
    point.total += 1
    if (task.status === 'COMPLETED') {
      point.completed += 1
    } else {
      point.pending += 1
    }
  }

  return points
}

export interface CategoryCount {
  category: string
  count: number
}

export function calculateCategoryDistribution(tasks: readonly StudyTask[]): CategoryCount[] {
  const counts = new Map<string, number>()
  for (const task of tasks) {
    const category = task.category.trim() || 'Other'
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
}

export type InsightTone = 'info' | 'success' | 'warning'

export interface Insight {
  id: string
  tone: InsightTone
  message: string
}

export interface InsightsInput {
  dsaProblems: readonly DSAProblem[]
  dsaProgress: readonly DSAProgress[]
  applications: readonly Application[]
  tasks: readonly StudyTask[]
  projects: readonly Project[]
}

export function generateInsights(input: InsightsInput): Insight[] {
  const insights: Insight[] = []

  const totalProblems = input.dsaProblems.length
  const solvedProblems = input.dsaProgress.filter(
    (item) => item.status === 'SOLVED',
  ).length
  const dsaCompletion = calculateCompletionPercentage(solvedProblems, totalProblems)

  const applicationCount = input.applications.length
  const interviewCount = input.applications.filter(
    (application) => application.status === 'INTERVIEW',
  ).length
  const selectedCount = input.applications.filter(
    (application) => application.status === 'SELECTED',
  ).length

  const study = calculateStudyCompletion(input.tasks)

  const completedProjects = input.projects.filter(
    (project) => project.status === 'COMPLETED',
  ).length

  if (applicationCount === 0) {
    insights.push({
      id: 'no-applications',
      tone: 'info',
      message:
        'No applications are recorded yet. Add your first application from the Applications section.',
    })
  }

  if (applicationCount > 0 && interviewCount === 0) {
    insights.push({
      id: 'applications-no-interview',
      tone: 'warning',
      message:
        'You have submitted applications but have not recorded an interview yet. Review application targeting and resume alignment.',
    })
  }

  if (applicationCount > 0 && interviewCount > 0 && selectedCount === 0) {
    insights.push({
      id: 'interviews-no-offer',
      tone: 'info',
      message:
        'You have reached interview stages but have not recorded a selection yet. Focus on interview preparation and timely follow-ups.',
    })
  }

  if (totalProblems > 0 && dsaCompletion < 30) {
    insights.push({
      id: 'dsa-below-thirty',
      tone: 'warning',
      message:
        'Your DSA completion is currently below 30%. Consider increasing your weekly problem-solving consistency.',
    })
  }

  if (totalProblems > 0 && dsaCompletion >= 70) {
    insights.push({
      id: 'dsa-strong',
      tone: 'success',
      message: `Your DSA completion rate is strong at ${displayPercentage(dsaCompletion)}. Keep up the problem-solving consistency.`,
    })
  }

  if (study.total === 0) {
    insights.push({
      id: 'no-study-tasks',
      tone: 'info',
      message:
        'No study tasks are recorded yet. Create tasks in the Study Planner to track your consistency.',
    })
  } else if (study.percentage > 80) {
    insights.push({
      id: 'study-strong',
      tone: 'success',
      message:
        'Your study task completion rate is strong. Maintain the current consistency.',
    })
  }

  if (completedProjects === 0) {
    insights.push({
      id: 'no-completed-projects',
      tone: 'warning',
      message:
        'No completed projects are currently recorded. Completing and documenting projects can strengthen your portfolio.',
    })
  }

  return insights
}