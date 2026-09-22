import { ChevronDown, Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ProjectStatus } from '../../types'
import { Card } from '../Card'
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from './projectMeta'

interface ProjectFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: ProjectStatus | 'ALL'
  onStatusChange: (value: ProjectStatus | 'ALL') => void
  technology: string
  onTechnologyChange: (value: string) => void
  technologies: string[]
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

export function ProjectFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  technology,
  onTechnologyChange,
  technologies,
  resultCount,
  totalCount,
  onClear,
}: ProjectFiltersProps) {
  const filtersActive =
    search.trim() !== '' || status !== 'ALL' || technology !== 'ALL'

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
            placeholder="Search projects..."
            aria-label="Search projects"
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FilterSelect
            label="Status"
            value={status}
            onChange={(value) => onStatusChange(value as ProjectStatus | 'ALL')}
          >
            <option value="ALL">All statuses</option>
            {PROJECT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {PROJECT_STATUS_LABELS[item]}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Technology"
            value={technology}
            onChange={onTechnologyChange}
          >
            <option value="ALL">All technologies</option>
            {technologies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-4">
          <p className="text-sm text-neutral-500">
            Showing{' '}
            <span className="font-semibold text-neutral-900">{resultCount}</span>{' '}
            of {totalCount} projects
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