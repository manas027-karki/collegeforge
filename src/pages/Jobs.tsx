import { useMemo, useState } from 'react'
import { EmptyJobs } from '../components/jobs/EmptyJobs'
import { JobCard } from '../components/jobs/JobCard'
import { JobDetailsModal } from '../components/jobs/JobDetailsModal'
import { JobFilters } from '../components/jobs/JobFilters'
import type { JobSort } from '../components/jobs/jobMeta'
import { mockData } from '../data/mockData'
import { useAppStore } from '../store/useAppStore'

export function Jobs() {
  const jobs = mockData.jobs
  const savedJobs = useAppStore((s) => s.jobsSaved)
  const toggleJobSaved = useAppStore((s) => s.toggleJobSaved)

  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('all')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState<JobSort>('newest')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location))].sort(),
    [jobs],
  )

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    const list = jobs.filter((job) => {
      const matchesSearch =
        query === '' ||
        job.company.toLowerCase().includes(query) ||
        job.title.toLowerCase().includes(query) ||
        job.skills.some((skill) => skill.toLowerCase().includes(query))
      const matchesLocation = location === 'all' || job.location === location
      const matchesType = type === 'all' || job.type === type
      return matchesSearch && matchesLocation && matchesType
    })

    return list.sort((a, b) =>
      sort === 'newest'
        ? b.postedAt.localeCompare(a.postedAt)
        : a.deadline.localeCompare(b.deadline),
    )
  }, [jobs, search, location, type, sort])

  const filtersActive = search.trim() !== '' || location !== 'all' || type !== 'all'
  const selectedJob = selectedJobId
    ? jobs.find((job) => job.id === selectedJobId) ?? null
    : null

  const handleReset = () => {
    setSearch('')
    setLocation('all')
    setType('all')
    setSort('newest')
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

      <JobFilters
        search={search}
        onSearchChange={setSearch}
        location={location}
        onLocationChange={setLocation}
        locations={locations}
        type={type}
        onTypeChange={setType}
        sort={sort}
        onSortChange={setSort}
        resultCount={filteredJobs.length}
        totalCount={jobs.length}
        onClear={handleReset}
      />

      {filteredJobs.length > 0 ? (
        <section aria-label="Job listings">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => (
              <li key={job.id}>
                <JobCard
                  job={job}
                  saved={savedJobs.includes(job.id)}
                  onToggleSave={toggleJobSaved}
                  onViewDetails={(current) => setSelectedJobId(current.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyJobs
          query={search}
          hasActiveFilters={filtersActive}
          onReset={handleReset}
        />
      )}

      {selectedJob ? (
        <JobDetailsModal
          job={selectedJob}
          saved={savedJobs.includes(selectedJob.id)}
          onClose={() => setSelectedJobId(null)}
          onToggleSave={toggleJobSaved}
        />
      ) : null}
    </div>
  )
}