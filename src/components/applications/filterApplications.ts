import type { Application, ApplicationStatus } from '../../types'

export interface ApplicationFiltersState {
  search: string
  status: ApplicationStatus | 'all'
  company: string
  location: string
}

export function filterApplications(
  applications: Application[],
  filters: ApplicationFiltersState,
): Application[] {
  const query = filters.search.trim().toLowerCase()

  return applications.filter((application) => {
    const matchesSearch =
      query === '' ||
      application.company.toLowerCase().includes(query) ||
      application.role.toLowerCase().includes(query) ||
      application.location.toLowerCase().includes(query)
    const matchesStatus =
      filters.status === 'all' || application.status === filters.status
    const matchesCompany =
      filters.company === 'all' || application.company === filters.company
    const matchesLocation =
      filters.location === 'all' || application.location === filters.location

    return matchesSearch && matchesStatus && matchesCompany && matchesLocation
  })
}