import { SearchX } from 'lucide-react'
import { Button } from '../Button'
import { EmptyState } from '../EmptyState'

interface EmptyJobsProps {
  query: string
  hasActiveFilters: boolean
  onReset: () => void
}

export function EmptyJobs({ query, hasActiveFilters, onReset }: EmptyJobsProps) {
  const title =
    query.trim() !== ''
      ? `No jobs match “${query.trim()}”`
      : 'No jobs match your filters'

  const description =
    query.trim() !== ''
      ? 'Try a different company, title, skill or keyword. You can also clear the filters to browse every opening.'
      : 'Try widening the location or job type filters, or clear them to see the full list of openings.'

  return (
    <EmptyState
      icon={SearchX}
      title={title}
      description={description}
      action={
        hasActiveFilters ? (
          <Button variant="secondary" onClick={onReset}>
            Clear all filters
          </Button>
        ) : undefined
      }
    />
  )
}