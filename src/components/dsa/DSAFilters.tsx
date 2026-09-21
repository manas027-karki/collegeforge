import { ChevronDown, Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Difficulty, ProblemStatus } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../Card'
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
} from './dsaMeta'

interface DSAFiltersProps {
  topics: string[]
  resultCount: number
  totalCount: number
}

const selectClass =
  'h-10 w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 pr-9 text-sm text-neutral-900 shadow-sm transition-colors hover:border-neutral-400 focus:border-primary-500 focus:outline-none'

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-500">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={selectClass}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        />
      </div>
    </div>
  )
}

export function DSAFilters({ topics, resultCount, totalCount }: DSAFiltersProps) {
  const filters = useAppStore((s) => s.dsaFilters)
  const setDSAFilters = useAppStore((s) => s.setDSAFilters)

  const filtersActive =
    filters.search.trim() !== '' ||
    filters.difficulty !== 'ALL' ||
    filters.topic !== 'ALL' ||
    filters.status !== 'ALL'

  const handleReset = () => {
    setDSAFilters({ search: '', difficulty: 'ALL', topic: 'ALL', status: 'ALL' })
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => setDSAFilters({ search: event.target.value })}
            placeholder="Search by problem title or topic..."
            aria-label="Search problems"
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FilterSelect
            label="Difficulty"
            value={filters.difficulty}
            onChange={(value) =>
              setDSAFilters({ difficulty: value as Difficulty | 'ALL' })
            }
          >
            <option value="ALL">All difficulties</option>
            {DIFFICULTY_ORDER.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {DIFFICULTY_LABELS[difficulty]}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Topic"
            value={filters.topic}
            onChange={(value) => setDSAFilters({ topic: value })}
          >
            <option value="ALL">All topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(value) =>
              setDSAFilters({ status: value as ProblemStatus | 'ALL' })
            }
          >
            <option value="ALL">All statuses</option>
            <option value="SOLVED">Solved</option>
            <option value="UNSOLVED">Unsolved</option>
          </FilterSelect>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-4">
          <p className="text-sm text-neutral-500">
            Showing{' '}
            <span className="font-semibold text-neutral-900">{resultCount}</span> of{' '}
            {totalCount} problems
          </p>

          {filtersActive ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
              Clear filters
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  )
}