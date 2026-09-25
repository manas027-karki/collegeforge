import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type AuthMessageType = 'error' | 'success' | 'info'

interface AuthMessageProps {
  type?: AuthMessageType
  children: ReactNode
  className?: string
}

const messageStyles: Record<AuthMessageType, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-primary-200 bg-primary-50 text-primary-700',
}

export function AuthMessage({ type = 'info', children, className }: AuthMessageProps) {
  const Icon = type === 'error' ? CircleAlert : type === 'success' ? CircleCheck : Info

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm leading-5',
        messageStyles[type],
        className,
      )}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
