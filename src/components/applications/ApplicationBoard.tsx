import { useMemo } from 'react'
import type { Application, ApplicationStatus } from '../../types'
import { APPLICATION_STATUSES } from './applicationMeta'
import { ApplicationColumn } from './ApplicationColumn'

interface ApplicationBoardProps {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
  onStatusChange: (id: string, status: ApplicationStatus) => void
}

export function ApplicationBoard({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
}: ApplicationBoardProps) {
  const grouped = useMemo(() => {
    const columns: Record<ApplicationStatus, Application[]> = {
      SAVED: [],
      APPLIED: [],
      OA: [],
      INTERVIEW: [],
      SELECTED: [],
      REJECTED: [],
    }
    for (const application of applications) {
      columns[application.status].push(application)
    }
    return columns
  }, [applications])

  return (
    <section aria-label="Application board">
      <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max items-stretch gap-4">
          {APPLICATION_STATUSES.map((status) => (
            <ApplicationColumn
              key={status}
              status={status}
              applications={grouped[status]}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </div>
    </section>
  )
}