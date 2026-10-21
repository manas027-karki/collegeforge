import { useEffect, useState } from 'react'
import { LoaderCircle, SearchX } from 'lucide-react'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { JobCard } from '../components/jobs/JobCard'
import { JobDetailsModal } from '../components/jobs/JobDetailsModal'
import { JobFilters } from '../components/jobs/JobFilters'
import { useAppStore } from '../store/useAppStore'

export function Jobs() {
  const jobs = useAppStore((s) => s.jobs)
  const jobsMeta = useAppStore((s) => s.jobsMeta)
  const jobsLoading = useAppStore((s) => s.jobsLoading)
  const jobsError = useAppStore((s) => s.jobsError)
  const jobFilters = useAppStore((s) => s.jobFilters)
  const setJobFilters = useAppStore((s) => s.setJobFilters)
  const fetchJobs = useAppStore((s) => s.fetchJobs)
  const toggleJobSaved = useAppStore((s) => s.toggleJobSaved)

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  // The job board is public, so it is fetched on its own rather than with
  // the account's own data.
  useEffect(() => {
    void fetchJobs()
  }, [fetchJobs])

  const selectedJob = selectedJobId
    ? jobs.find((job) => job.id === selectedJobId) ?? null
    : null

  const handleReset = () => {
    setJobFilters({
      search: '',
      location: 'all',
      type: 'all',
      sort: 'newest',
      page: 1,
    })
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Jobs &amp; Internships
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Search for openings, filter by location and type, and save the roles
          you want to apply for.
        </p>
      </section>

      {jobsError ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800"
        >
          {jobsError}
        </p>
      ) : null}

      <JobFilters
        search={jobFilters.search}
        onSearchChange={(value) => setJobFilters({ search: value })}
        location={jobFilters.location}
        onLocationChange={(value) => setJobFilters({ location: value })}
        locations={jobsMeta.locations}
        type={jobFilters.type}
        onTypeChange={(value) =>
          setJobFilters({ type: value as typeof jobFilters.type })
        }
        sort={jobFilters.sort}
        onSortChange={(value) => setJobFilters({ sort: value })}
        resultCount={jobsMeta.total}
        totalCount={jobsMeta.totalAll}
        onClear={handleReset}
      />

      {jobsLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-8 text-sm text-neutral-500"
        >
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-primary-600" />
          Loading the job board...
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No jobs found"
          description="Nothing matches your current filters. Try adjusting the search, location or type."
          action={
            <Button variant="secondary" onClick={handleReset}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <section aria-label="Job listings">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard
                  job={job}
                  saved={job.saved}
                  onToggleSave={toggleJobSaved}
                  onViewDetails={(current) => setSelectedJobId(current.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {selectedJob ? (
        <JobDetailsModal
          job={selectedJob}
          saved={selectedJob.saved}
          onClose={() => setSelectedJobId(null)}
          onToggleSave={toggleJobSaved}
        />
      ) : null}
    </div>
  )
}
