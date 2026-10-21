export const TODAY_ISO = '2026-09-20'

/**
 * Parses a date string into a `Date`.
 *
 * Two formats reach this module: a date-only string like `2026-06-01`, which
 * the app treats as local midnight, and a full ISO timestamp from the API,
 * which is absolute. Both have to work, and the date-only form must not be
 * re-read as UTC — that would shift it by a day in every timezone behind
 * Greenwich.
 */
function parseDate(dateIso: string): Date | null {
  if (!dateIso) return null

  const value = /^\d{4}-\d{2}-\d{2}$/.test(dateIso)
    ? new Date(`${dateIso}T00:00:00`)
    : new Date(dateIso)

  return Number.isNaN(value.getTime()) ? null : value
}

export function formatDate(dateIso: string): string {
  const d = parseDate(dateIso)
  if (!d) return dateIso
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(dateIso: string): string {
  const d = parseDate(dateIso)
  if (!d) return dateIso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function daysUntil(dateIso: string): number {
  const now = parseDate(TODAY_ISO)
  const then = parseDate(dateIso)
  if (!now || !then) return 0
  return Math.round((then.getTime() - now.getTime()) / 86400000)
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
