import { CheckCircle2, Circle } from 'lucide-react'
import type { DSAProblem, DSAProgress } from '../../types'
import { cn } from '../../lib/cn'
import { formatShortDate } from '../../lib/dates'
import { Button } from '../Button'
import { StatusBadge } from '../StatusBadge'
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_TONES,
  PLATFORM_CHIP_CLASS,
  PLATFORM_LABELS,
} from './dsaMeta'

interface ProblemRowProps {
  layout: 'row' | 'card'
  problem: DSAProblem
  progress?: DSAProgress
  onView: (problem: DSAProblem) => void
  onToggleStatus: (problem: DSAProblem) => void
}

function StatusChip({
  solved,
  onToggle,
  title,
}: {
  solved: boolean
  onToggle: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
        solved
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100'
          : 'bg-neutral-100 text-neutral-600 ring-neutral-200 hover:bg-neutral-200',
      )}
    >
      {solved ? (
        <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
      ) : (
        <Circle aria-hidden="true" className="h-3.5 w-3.5" />
      )}
      {solved ? 'Solved' : 'Unsolved'}
    </button>
  )
}

export function ProblemRow({
  layout,
  problem,
  progress,
  onView,
  onToggleStatus,
}: ProblemRowProps) {
  const solved = progress?.status === 'SOLVED'
  const attempts = progress?.attempts ?? 0
  const lastSolvedAt = progress?.lastSolvedAt

  const toggle = () => onToggleStatus(problem)

  if (layout === 'card') {
    return (
      <li className="p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onView(problem)}
            className="min-w-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <span className="block text-sm font-semibold text-neutral-900 transition-colors hover:text-primary-700">
              {problem.title}
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500">
              {problem.topic}
            </span>
          </button>
          <Button variant="secondary" size="sm" onClick={() => onView(problem)}>
            View
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <StatusBadge
            label={DIFFICULTY_LABELS[problem.difficulty]}
            tone={DIFFICULTY_TONES[problem.difficulty]}
          />
          <span
            className={cn(
              'inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
              PLATFORM_CHIP_CLASS[problem.platform],
            )}
          >
            {PLATFORM_LABELS[problem.platform]}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
          <StatusChip
            solved={solved}
            onToggle={toggle}
            title={solved ? 'Mark as unsolved' : 'Mark as solved'}
          />
          <span className="inline-flex items-center gap-3">
            <span className="tabular-nums">{attempts} attempts</span>
            <span>Last solved: {lastSolvedAt ? formatShortDate(lastSolvedAt) : '—'}</span>
          </span>
        </div>
      </li>
    )
  }

  return (
    <tr className="transition-colors hover:bg-neutral-50/60">
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onView(problem)}
          className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          title={`View ${problem.title}`}
        >
          <span className="block max-w-[280px] truncate text-sm font-medium text-neutral-900 transition-colors hover:text-primary-700">
            {problem.title}
          </span>
        </button>
      </td>
      <td className="px-4 py-3">
        <StatusBadge
          label={DIFFICULTY_LABELS[problem.difficulty]}
          tone={DIFFICULTY_TONES[problem.difficulty]}
        />
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          {problem.topic}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
            PLATFORM_CHIP_CLASS[problem.platform],
          )}
        >
          {PLATFORM_LABELS[problem.platform]}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusChip
          solved={solved}
          onToggle={toggle}
          title={solved ? 'Mark as unsolved' : 'Mark as solved'}
        />
      </td>
      <td className="px-4 py-3 text-sm tabular-nums text-neutral-600">{attempts}</td>
      <td className="px-4 py-3 text-sm text-neutral-600">
        {lastSolvedAt ? formatShortDate(lastSolvedAt) : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <Button variant="secondary" size="sm" onClick={() => onView(problem)}>
          View
        </Button>
      </td>
    </tr>
  )
}