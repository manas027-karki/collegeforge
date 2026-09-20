import { cn } from '../lib/cn'

interface AvatarProps {
  label: string
  className?: string
}

export function Avatar({ label, className }: AvatarProps) {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-neutral-100 font-medium text-neutral-600 ring-1 ring-inset ring-neutral-200',
        className ?? 'h-8 w-8 text-xs',
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}