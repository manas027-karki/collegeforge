import { useMemo, useState } from 'react'
import { Binary, LoaderCircle, Plus, SearchX } from 'lucide-react'
import { AddProblemModal } from '../components/dsa/AddProblemModal'
import { DifficultyChart } from '../components/dsa/DifficultyChart'
import { DSAFilters } from '../components/dsa/DSAFilters'
import { DSAProgressChart } from '../components/dsa/DSAProgressChart'
import { DSAStats } from '../components/dsa/DSAStats'
import { filterDSAProblems } from '../components/dsa/dsaFilter'
import { computeDSAStats } from '../components/dsa/dsaStatsUtils'
import { ProblemDetailsModal } from '../components/dsa/ProblemDetailsModal'
import { ProblemTable } from '../components/dsa/ProblemTable'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { buildMonthlySolvedSeries } from '../lib/analytics'
import { useAppStore } from '../store/useAppStore'
import type { DSAProblem, DSAProblemInput } from '../types'

export function DSA() {
  const problems = useAppStore((s) => s.dsaProblems)
  const progress = useAppStore((s) => s.dsaProgress)
  const dsaLoading = useAppStore((s) => s.dsaLoading)
  const dsaError = useAppStore((s) => s.dsaError)
  const filters = useAppStore((s) => s.dsaFilters)
  const setDSAFilters = useAppStore((s) => s.setDSAFilters)
  const addDSAProblem = useAppStore((s) => s.addDSAProblem)
  const markProblemSolved = useAppStore((s) => s.markProblemSolved)
  const markProblemUnsolved = useAppStore((s) => s.markProblemUnsolved)

  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const stats = useMemo(
    () => computeDSAStats(problems, progress),
    [problems, progress],
  )

  // The chart is built from the user's own solves rather than a fixed
  // series, so it reflects what they have actually done.
  const solvedOverTime = useMemo(
    () => buildMonthlySolvedSeries(progress),
    [progress],
  )

  const filteredProblems = useMemo(
    () => filterDSAProblems(problems, progress, filters),
    [problems, progress, filters],
  )

  const topics = useMemo(
    () => [...new Set(problems.map((problem) => problem.topic))].sort(),
    [problems],
  )

  const detailsProblem = detailsId
    ? problems.find((problem) => problem.id === detailsId) ?? null
    : null

  const handleToggleStatus = (problem: DSAProblem) => {
    const entry = progress.find((item) => item.problemId === problem.id)
    if (entry?.status === 'SOLVED') {
      void markProblemUnsolved(problem.id)
    } else {
      void markProblemSolved(problem.id)
    }
  }

  const handleAddProblem = async (input: DSAProblemInput) => {
    try {
      await addDSAProblem(input)
      setAddOpen(false)
    } catch {
      // The store already recorded the reason; it is shown on the page.
    }
  }

  const handleResetFilters = () => {
    setDSAFilters({ search: '', difficulty: 'ALL', topic: 'ALL', status: 'ALL' })
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            DSA Tracker
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track your problem-solving progress and build consistent DSA habits.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add Problem
        </Button>
      </section>

      <DSAStats stats={stats} />

      <section
        aria-label="DSA charts"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <DSAProgressChart data={solvedOverTime} />
        <DifficultyChart stats={stats} />
      </section>

      <DSAFilters
        topics={topics}
        resultCount={filteredProblems.length}
        totalCount={problems.length}
      />

      {dsaError ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800"
        >
          {dsaError}
        </p>
      ) : null}

      {dsaLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-8 text-sm text-neutral-500"
        >
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-primary-600" />
          Loading your problems...
        </div>
      ) : problems.length === 0 ? (
        <EmptyState
          icon={Binary}
          title="No DSA problems yet"
          description="Add your first problem to start tracking progress."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Problem
            </Button>
          }
        />
      ) : filteredProblems.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No problems found"
          description="Try changing your search or filters."
          action={
            <Button variant="secondary" onClick={handleResetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ProblemTable
          problems={filteredProblems}
          progress={progress}
          onView={(problem) => setDetailsId(problem.id)}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {detailsProblem ? (
        <ProblemDetailsModal
          problem={detailsProblem}
          onClose={() => setDetailsId(null)}
        />
      ) : null}

      {addOpen ? (
        <AddProblemModal onClose={() => setAddOpen(false)} onSubmit={handleAddProblem} />
      ) : null}
    </div>
  )
}