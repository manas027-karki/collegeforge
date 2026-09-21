import { Circle, CircleCheck, ExternalLink, RefreshCw, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import type { DSAProblem } from '../../types'
import { cn } from '../../lib/cn'
import { formatDate } from '../../lib/dates'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../Button'
import { StatusBadge } from '../StatusBadge'
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_TONES,
  PLATFORM_CHIP_CLASS,
  PLATFORM_LABELS,
} from './dsaMeta'

interface ProblemDetailsModalProps {
  problem: DSAProblem
  onClose: () => void
}

export function ProblemDetailsModal({ problem, onClose }: ProblemDetailsModalProps) {
  const progress = useAppStore((s) =>
    s.dsaProgress.find((item) => item.problemId === problem.id),
  )
  const markProblemSolved = useAppStore((s) => s.markProblemSolved)
  const markProblemUnsolved = useAppStore((s) => s.markProblemUnsolved)
  const recordAttempt = useAppStore((s) => s.recordAttempt)
  const deleteDSAProblem = useAppStore((s) => s.deleteDSAProblem)

  const solved = progress?.status === 'SOLVED'
  const attempts = progress?.attempts ?? 0
  const lastSolvedAt = progress?.lastSolvedAt

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

  const handleOpenProblem = () => {
    if (problem.url) {
      window.open(problem.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDelete = () => {
    deleteDSAProblem(problem.id)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-details-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="problem-details-title"
              className="truncate text-lg font-semibold tracking-tight text-neutral-900"
            >
              {problem.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge
                label={DIFFICULTY_LABELS[problem.difficulty]}
                tone={DIFFICULTY_TONES[problem.difficulty]}
              />
              <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {problem.topic}
              </span>
              <span
                className={cn(
                  'inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                  PLATFORM_CHIP_CLASS[problem.platform],
                )}
              >
                {PLATFORM_LABELS[problem.platform]}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete problem"
              title="Delete problem"
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close problem details"
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3">
            {solved ? (
              <CircleCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <Circle aria-hidden="true" className="h-5 w-5 shrink-0 text-neutral-400" />
            )}
            <p className="text-sm font-medium text-neutral-900">
              {solved ? 'Solved' : 'Unsolved'}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
              <dt className="text-xs font-medium text-neutral-500">Status</dt>
              <dd className="mt-1 text-sm font-medium text-neutral-900">
                {solved ? 'SOLVED' : 'UNSOLVED'}
              </dd>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
              <dt className="text-xs font-medium text-neutral-500">Attempts</dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-neutral-900">
                {attempts}
              </dd>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-3">
              <dt className="text-xs font-medium text-neutral-500">Last solved</dt>
              <dd className="mt-1 text-sm font-medium text-neutral-900">
                {lastSolvedAt ? formatDate(lastSolvedAt) : 'Never'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <Button variant="ghost" onClick={() => recordAttempt(problem.id)}>
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Record attempt
          </Button>
          <Button
            variant={solved ? 'secondary' : 'primary'}
            onClick={() =>
              solved
                ? markProblemUnsolved(problem.id)
                : markProblemSolved(problem.id)
            }
          >
            {solved ? 'Mark Unsolved' : 'Mark Solved'}
          </Button>
          <Button
            variant={solved ? 'primary' : 'secondary'}
            onClick={handleOpenProblem}
            disabled={!problem.url}
            title={problem.url ? 'Open problem page in a new tab' : 'No problem URL available'}
          >
            Open Problem
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}