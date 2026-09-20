export const TODAY_ISO = '2026-09-20'

export function formatDate(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateIso
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateIso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function daysUntil(dateIso: string): number {
  const now = Date.parse(`${TODAY_ISO}T00:00:00`)
  const then = Date.parse(`${dateIso}T00:00:00`)
  if (Number.isNaN(now) || Number.isNaN(then)) return 0
  return Math.round((then - now) / 86400000)
}