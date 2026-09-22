import { TODAY_ISO } from '../../lib/dates'
import type { StudyTask } from '../../types'

export interface StudyStats {
  today: number
  week: number
  completed: number
  completionRate: number
}

export interface WeeklyPoint {
  day: string
  scheduled: number
  completed: number
}

function parse(dateIso: string): Date {
  return new Date(`${dateIso}T00:00:00`)
}

function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function addDays(dateIso: string, days: number): string {
  const date = parse(dateIso)
  date.setDate(date.getDate() + days)
  return toIso(date)
}

export function getWeekRange(
  todayIso = TODAY_ISO,
): { start: string; end: string } {
  const date = parse(todayIso)
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + mondayOffset)
  const start = toIso(date)
  const end = addDays(start, 6)
  return { start, end }
}

export function computeStudyStats(tasks: StudyTask[]): StudyStats {
  const { start, end } = getWeekRange()
  const today = tasks.filter((task) => task.dueDate === TODAY_ISO).length
  const week = tasks.filter(
    (task) => task.dueDate >= start && task.dueDate <= end,
  ).length
  const completed = tasks.filter((task) => task.status === 'COMPLETED').length
  const total = tasks.length
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100)

  return { today, week, completed, completionRate }
}

export function computeWeeklyProgress(tasks: StudyTask[]): WeeklyPoint[] {
  const { start } = getWeekRange()

  return Array.from({ length: 7 }, (_, index) => {
    const dayIso = addDays(start, index)
    const dayTasks = tasks.filter((task) => task.dueDate === dayIso)
    return {
      day: parse(dayIso).toLocaleDateString('en-US', { weekday: 'short' }),
      scheduled: dayTasks.filter((task) => task.status === 'TODO').length,
      completed: dayTasks.filter((task) => task.status === 'COMPLETED').length,
    }
  })
}