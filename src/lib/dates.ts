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

export function getDeadlineMeta(
  dateIso: string,
): { label: string; className: string } {
  const days = daysUntil(dateIso)
  if (days < 0) return { label: 'Closed', className: 'text-neutral-500' }
  if (days === 0) return { label: 'Today', className: 'bg-amber-50 text-amber-700' }
  if (days <= 5) return { label: `${days} days left`, className: 'bg-rose-50 text-rose-700' }
  return { label: `${days} days left`, className: 'bg-neutral-100 text-neutral-600' }
}