import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white',
        'shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}