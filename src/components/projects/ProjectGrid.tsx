import type { Project } from '../../types'
import { ProjectCard } from './ProjectCard'

interface ProjectGridProps {
  projects: Project[]
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectGrid({
  projects,
  onView,
  onEdit,
  onDelete,
}: ProjectGridProps) {
  return (
    <section
      aria-label="Projects"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  )
}