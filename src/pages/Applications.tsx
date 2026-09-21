import { useMemo, useState } from 'react'
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Inbox,
  Plus,
  SearchX,
  XCircle,
} from 'lucide-react'
import { ApplicationBoard } from '../components/applications/ApplicationBoard'
import { ApplicationFilters } from '../components/applications/ApplicationFilters'
import { ApplicationModal } from '../components/applications/ApplicationModal'
import { ConfirmDeleteDialog } from '../components/applications/ConfirmDeleteDialog'
import {
  ACTIVE_APPLICATION_STATUSES,
} from '../components/applications/applicationMeta'
import {
  filterApplications,
  type ApplicationFiltersState,
} from '../components/applications/filterApplications'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { useAppStore } from '../store/useAppStore'
import type {
  Application,
  ApplicationInput,
  ApplicationStatus,
} from '../types'

export function Applications() {
  const applications = useAppStore((s) => s.applications)
  const addApplication = useAppStore((s) => s.addApplication)
  const updateApplication = useAppStore((s) => s.updateApplication)
  const deleteApplication = useAppStore((s) => s.deleteApplication)
  const updateApplicationStatus = useAppStore((s) => s.updateApplicationStatus)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all')
  const [company, setCompany] = useState('all')
  const [location, setLocation] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null)

  const filters: ApplicationFiltersState = useMemo(
    () => ({ search, status, company, location }),
    [search, status, company, location],
  )

  const filteredApplications = useMemo(
    () => filterApplications(applications, filters),
    [applications, filters],
  )

  const companies = useMemo(
    () => [...new Set(applications.map((application) => application.company))].sort(),
    [applications],
  )

  const boardLocations = useMemo(
    () => [...new Set(applications.map((application) => application.location))].sort(),
    [applications],
  )

  const stats = useMemo(() => {
    const active = applications.filter((application) =>
      ACTIVE_APPLICATION_STATUSES.includes(application.status),
    ).length
    const interviews = applications.filter(
      (application) => application.status === 'INTERVIEW',
    ).length
    const selected = applications.filter(
      (application) => application.status === 'SELECTED',
    ).length
    const rejected = applications.filter(
      (application) => application.status === 'REJECTED',
    ).length
    return { total: applications.length, active, interviews, selected, rejected }
  }, [applications])

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setCompany('all')
    setLocation('all')
  }

  const openAddModal = () => {
    setEditingApplication(null)
    setModalOpen(true)
  }

  const openEditModal = (application: Application) => {
    setEditingApplication(application)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingApplication(null)
  }

  const handleSave = (values: ApplicationInput) => {
    if (editingApplication) {
      updateApplication(editingApplication.id, values)
    } else {
      addApplication({ id: `app-${Date.now()}`, ...values })
    }
    closeModal()
  }

  const handleStatusChange = (id: string, nextStatus: ApplicationStatus) => {
    updateApplicationStatus(id, nextStatus)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) deleteApplication(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Applications
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track your internship and job applications from application to offer.
          </p>
        </div>
        <Button onClick={openAddModal} className="shrink-0">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add Application
        </Button>
      </section>

      <section
        aria-label="Application statistics"
        className="grid grid-cols-2 gap-4 xl:grid-cols-5"
      >
        <StatCard
          label="Total Applications"
          value={stats.total}
          description="Across all stages"
          icon={Inbox}
          tone="primary"
        />
        <StatCard
          label="Active Applications"
          value={stats.active}
          description="Saved to interview"
          icon={Activity}
          tone="blue"
        />
        <StatCard
          label="Interviews"
          value={stats.interviews}
          description="Interview stage"
          icon={CalendarCheck}
          tone="amber"
        />
        <StatCard
          label="Selected"
          value={stats.selected}
          description="Offers received"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          description="No offer"
          icon={XCircle}
          tone="red"
        />
      </section>

      <ApplicationFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        company={company}
        onCompanyChange={setCompany}
        companies={companies}
        location={location}
        onLocationChange={setLocation}
        locations={boardLocations}
        resultCount={filteredApplications.length}
        totalCount={applications.length}
        onClear={handleReset}
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No applications yet"
          description="Add your first application to start tracking your hiring pipeline."
          action={
            <Button onClick={openAddModal}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Application
            </Button>
          }
        />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching applications"
          description="Nothing matches your current filters. Try adjusting search, status, company or location."
          action={
            <Button variant="secondary" onClick={handleReset}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ApplicationBoard
          applications={filteredApplications}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
          onStatusChange={handleStatusChange}
        />
      )}

      {modalOpen ? (
        <ApplicationModal
          application={editingApplication}
          onClose={closeModal}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteDialog
          application={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  )
}