import { CheckCircle2, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  action,
  className,
}: SettingsSectionProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={cn('space-y-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 id={headingId} className="text-lg font-semibold tracking-tight text-neutral-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

interface SettingsToggleProps {
  checked: boolean
  label: string
  onChange: () => void
}

export function SettingsToggle({ checked, label, onChange }: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-primary-600' : 'bg-neutral-300',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

type FeedbackTone = 'success' | 'info' | 'warning'

interface SettingsFeedbackProps {
  message: string
  tone?: FeedbackTone
  className?: string
}

const feedbackToneMap: Record<FeedbackTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-primary-200 bg-primary-50 text-primary-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
}

export function SettingsFeedback({ message, tone = 'success', className }: SettingsFeedbackProps) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'warning' ? TriangleAlert : Info

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        feedbackToneMap[tone],
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

interface SettingsModalProps {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  tone?: 'default' | 'danger'
}

export function SettingsModal({
  title,
  description,
  onClose,
  children,
  footer,
  tone = 'default',
}: SettingsModalProps) {
  const titleId = useId()
  const descriptionId = description ? `${titleId}-description` : undefined

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
      />
      <div
        className={cn(
          'relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-white shadow-xl sm:rounded-2xl',
          tone === 'danger' ? 'border-rose-200' : 'border-neutral-200',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-neutral-900">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm leading-6 text-neutral-500">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
