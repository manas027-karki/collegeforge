import type { Application, ApplicationStatus } from '../../types'
import { APPLICATION_STATUS_DOTS, APPLICATION_STATUS_LABELS } from './applicationMeta'
import { ApplicationCard } from './ApplicationCard'

interface ApplicationColumnProps {
  status: ApplicationStatus
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
  onStatusChange: (id: string, status: ApplicationStatus) => void
}

export function ApplicationColumn({
  status,
  applications,
  onEdit,
  onDelete,
  onStatusChange,
}: ApplicationColumnProps) {
  return (
    <section
      aria-label={`${APPLICATION_STATUS_LABELS[status]} applications`}
      className="flex w-72 shrink-0 flex-col rounded-xl border border-neutral-200 bg-neutral-100/70"
    >
      <header className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${APPLICATION_STATUS_DOTS[status]}`}
          />
          <h2 className="truncate text-sm font-semibold text-neutral-900">
            {APPLICATION_STATUS_LABELS[status]}
          </h2>
        </div>
        <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-xs font-medium tabular-nums text-neutral-600 ring-1 ring-inset ring-neutral-200">
          {applications.length}
        </span>
      </header>

      <div className="flex-1 space-y-3 p-3">
        {applications.length > 0 ? (
          applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white/50 px-3 py-8 text-center">
            <p className="text-xs font-medium text-neutral-500">No applications yet</p>
          </div>
        )}
      </div>
    </section>
  )
}