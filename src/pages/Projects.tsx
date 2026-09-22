import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  FolderKanban,
  Layers,
  Plus,
  SearchX,
  SquareActivity,
} from 'lucide-react'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { GitHubIcon } from '../components/GitHubIcon'
import {
  ConfirmDeleteProjectDialog,
} from '../components/projects/ConfirmDeleteProjectDialog'
import { ProjectDetailsModal } from '../components/projects/ProjectDetailsModal'
import { ProjectFilters } from '../components/projects/ProjectFilters'
import { ProjectGrid } from '../components/projects/ProjectGrid'
import { ProjectModal } from '../components/projects/ProjectModal'
import { filterProjects } from '../components/projects/projectFilter'
import { StatCard } from '../components/StatCard'
import { TODAY_ISO } from '../lib/dates'
import { useAppStore } from '../store/useAppStore'
import type { Project, ProjectInput } from '../types'

export function Projects() {
  const projects = useAppStore((s) => s.projects)
  const projectFilters = useAppStore((s) => s.projectFilters)
  const setProjectFilters = useAppStore((s) => s.setProjectFilters)
  const addProject = useAppStore((s) => s.addProject)
  const updateProject = useAppStore((s) => s.updateProject)
  const deleteProject = useAppStore((s) => s.deleteProject)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [detailsProject, setDetailsProject] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const technologies = useMemo(
    () => [...new Set(projects.flatMap((project) => project.technologies))].sort(),
    [projects],
  )

  const filteredProjects = useMemo(
    () => filterProjects(projects, projectFilters),
    [projects, projectFilters],
  )

  const stats = useMemo(() => {
    const completed = projects.filter(
      (project) => project.status === 'COMPLETED',
    ).length
    const inProgress = projects.filter(
      (project) => project.status === 'IN_PROGRESS',
    ).length
    return {
      total: projects.length,
      completed,
      inProgress,
      technologies: technologies.length,
    }
  }, [projects, technologies])

  const openAddModal = () => {
    setEditingProject(null)
    setModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProject(null)
  }

  const handleSave = (values: ProjectInput) => {
    if (editingProject) {
      updateProject(editingProject.id, values)
    } else {
      addProject({
        id: `proj-${Date.now()}`,
        createdAt: TODAY_ISO,
        updatedAt: TODAY_ISO,
        ...values,
      })
    }
    closeModal()
  }

  const handleResetFilters = () => {
    setProjectFilters({ search: '', status: 'ALL', technology: 'ALL' })
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) deleteProject(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Projects
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your projects, technologies and portfolio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            disabled
            title="Coming soon - GitHub integration"
            aria-disabled="true"
          >
            <GitHubIcon className="h-4 w-4" />
            Import from GitHub
          </Button>
          <Button onClick={openAddModal} className="shrink-0">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add Project
          </Button>
        </div>
      </section>

      <section
        aria-label="Project statistics"
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
      >
        <StatCard
          label="Total Projects"
          value={stats.total}
          description="In your portfolio"
          icon={FolderKanban}
          tone="primary"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          description="Shipped projects"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          description="Actively building"
          icon={SquareActivity}
          tone="blue"
        />
        <StatCard
          label="Technologies Used"
          value={stats.technologies}
          description="Unique technologies"
          icon={Layers}
          tone="purple"
        />
      </section>

      <ProjectFilters
        search={projectFilters.search}
        onSearchChange={(value) => setProjectFilters({ search: value })}
        status={projectFilters.status}
        onStatusChange={(value) => setProjectFilters({ status: value })}
        technology={projectFilters.technology}
        onTechnologyChange={(value) => setProjectFilters({ technology: value })}
        technologies={technologies}
        resultCount={filteredProjects.length}
        totalCount={projects.length}
        onClear={handleResetFilters}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Add your first project to start building your portfolio."
          action={
            <Button onClick={openAddModal}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add Project
            </Button>
          }
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching projects"
          description="Nothing matches your current filters. Try adjusting search, status or technology."
          action={
            <Button variant="secondary" onClick={handleResetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ProjectGrid
          projects={filteredProjects}
          onView={setDetailsProject}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
        />
      )}

      {modalOpen ? (
        <ProjectModal
          project={editingProject}
          suggestions={technologies}
          onClose={closeModal}
          onSave={handleSave}
        />
      ) : null}

      {detailsProject ? (
        <ProjectDetailsModal
          project={detailsProject}
          onClose={() => setDetailsProject(null)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteProjectDialog
          project={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  )
}