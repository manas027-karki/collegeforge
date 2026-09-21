import { ChevronDown, Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ApplicationStatus } from '../../types'
import { Card } from '../Card'
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
} from './applicationMeta'

interface ApplicationFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: ApplicationStatus | 'all'
  onStatusChange: (value: ApplicationStatus | 'all') => void
  company: string
  onCompanyChange: (value: string) => void
  companies: string[]
  location: string
  onLocationChange: (value: string) => void
  locations: string[]
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

export function ApplicationFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  company,
  onCompanyChange,
  companies,
  location,
  onLocationChange,
  locations,
  resultCount,
  totalCount,
  onClear,
}: ApplicationFiltersProps) {
  const filtersActive =
    search.trim() !== '' || status !== 'all' || company !== 'all' || location !== 'all'

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
            placeholder="Search by company, role or location..."
            aria-label="Search applications"
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 hover:border-neutral-400 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FilterSelect
            label="Status"
            value={status}
            onChange={(value) => onStatusChange(value as ApplicationStatus | 'all')}
          >
            <option value="all">All statuses</option>
            {APPLICATION_STATUSES.map((item) => (
              <option key={item} value={item}>
                {APPLICATION_STATUS_LABELS[item]}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Company" value={company} onChange={onCompanyChange}>
            <option value="all">All companies</option>
            {companies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Location" value={location} onChange={onLocationChange}>
            <option value="all">All locations</option>
            {locations.map((item) => (
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
            of {totalCount} applications
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