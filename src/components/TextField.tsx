import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, id, className, ...rest }: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-10 w-full rounded-lg border bg-white px-3 text-sm text-neutral-900 shadow-sm transition-colors',
          'placeholder:text-neutral-400',
          error
            ? 'border-rose-300 focus-visible:outline-rose-500'
            : 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500',
        )}
        {...rest}
      />
      {error ? (
        <p id={`${fieldId}-error`} role="alert" className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}