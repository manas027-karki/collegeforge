import { useMemo } from 'react'
import type { DSAProblem, DSAProgress } from '../../types'
import { Card } from '../Card'
import { ProblemRow } from './ProblemRow'

interface ProblemTableProps {
  problems: DSAProblem[]
  progress: DSAProgress[]
  onView: (problem: DSAProblem) => void
  onToggleStatus: (problem: DSAProblem) => void
}

export function ProblemTable({
  problems,
  progress,
  onView,
  onToggleStatus,
}: ProblemTableProps) {
  const progressByProblem = useMemo(
    () => new Map(progress.map((item) => [item.problemId, item])),
    [progress],
  )

  return (
    <Card className="overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Problem
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Difficulty
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Topic
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Platform
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Attempts
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Last Solved
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {problems.map((problem) => (
              <ProblemRow
                key={`table-${problem.id}`}
                layout="row"
                problem={problem}
                progress={progressByProblem.get(problem.id)}
                onView={onView}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-neutral-100 md:hidden">
        {problems.map((problem) => (
          <ProblemRow
            key={`card-${problem.id}`}
            layout="card"
            problem={problem}
            progress={progressByProblem.get(problem.id)}
            onView={onView}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </ul>
    </Card>
  )
}