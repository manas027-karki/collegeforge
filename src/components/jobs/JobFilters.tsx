import { ChevronDown, Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '../Card'
import { JOB_TYPES, jobTypeLabel, sortOptions, type JobSort } from './jobMeta'

interface JobFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  location: string
  onLocationChange: (value: string) => void
  locations: string[]
  type: string
  onTypeChange: (value: string) => void
  sort: JobSort
  onSortChange: (value: JobSort) => void
  resultCount: number
  totalCount: number
  onClear: () => void
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

export function JobFilters({
  search,
  onSearchChange,
  location,
  onLocationChange,
  locations,
  type,
  onTypeChange,
  sort,
  onSortChange,
  resultCount,
  totalCount,
  onClear,
}: JobFiltersProps) {
  const filtersActive = search.trim() !== '' || location !== 'all' || type !== 'all'

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
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by company, title or skill..."
            aria-label="Search jobs"
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FilterSelect
            label="Location"
            value={location}
            onChange={onLocationChange}
          >
            <option value="all">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Job type" value={type} onChange={onTypeChange}>
            <option value="all">All types</option>
            {JOB_TYPES.map((jobType) => (
              <option key={jobType} value={jobType}>
                {jobTypeLabel[jobType]}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Sort by"
            value={sort}
            onChange={(value) => onSortChange(value as JobSort)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-4">
          <p className="text-sm text-neutral-500">
            Showing{' '}
            <span className="font-semibold text-neutral-900">{resultCount}</span>{' '}
            of {totalCount} jobs
          </p>

          {filtersActive ? (
            <button
              type="button"
              onClick={onClear}
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