import type { Project, ProjectStatus } from '../../types'

export interface ProjectFiltersState {
  search: string
  status: ProjectStatus | 'ALL'
  technology: string
}

export function filterProjects(
  projects: Project[],
  filters: ProjectFiltersState,
): Project[] {
  const query = filters.search.trim().toLowerCase()

  return projects.filter((project) => {
    const matchesSearch =
      query === '' ||
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.technologies.some((technology) =>
        technology.toLowerCase().includes(query),
      )
    const matchesStatus =
      filters.status === 'ALL' || project.status === filters.status
    const matchesTechnology =
      filters.technology === 'ALL' ||
      project.technologies.includes(filters.technology)

    return matchesSearch && matchesStatus && matchesTechnology
  })
}