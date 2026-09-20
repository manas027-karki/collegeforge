import { create } from 'zustand'
import { mockData } from '../data/mockData'
import type {
  Application,
  ApplicationStatus,
  DashboardStats,
  Project,
  StudyTask,
} from '../types'

interface AppState {
  sidebarOpen: boolean
  applications: Application[]
  applicationCounts: Record<ApplicationStatus, number>
  projects: Project[]
  tasks: StudyTask[]
  dashboardStats: DashboardStats
  jobsSaved: string[]

  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
  addApplication: (application: Application) => void
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void
  toggleJobSaved: (jobId: string) => void
  addProject: (project: Project) => void
  addTask: (task: StudyTask) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  applications: mockData.applications,
  applicationCounts: mockData.applicationCounts,
  projects: mockData.projects,
  tasks: mockData.studyTasks,
  dashboardStats: mockData.dashboardStats,
  jobsSaved: mockData.jobs.filter((job) => job.saved).map((job) => job.id),

  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addApplication: (application) =>
    set((state) => ({
      applications: [application, ...state.applications],
      applicationCounts: {
        ...state.applicationCounts,
        [application.status]: state.applicationCounts[application.status] + 1,
      },
    })),

  updateApplicationStatus: (id, status) =>
    set((state) => {
      const current = state.applications.find((app) => app.id === id)
      if (!current || current.status === status) return state
      return {
        applications: state.applications.map((app) =>
          app.id === id ? { ...app, status } : app,
        ),
        applicationCounts: {
          ...state.applicationCounts,
          [current.status]: state.applicationCounts[current.status] - 1,
          [status]: state.applicationCounts[status] + 1,
        },
      }
    }),

  toggleJobSaved: (jobId) =>
    set((state) => ({
      jobsSaved: state.jobsSaved.includes(jobId)
        ? state.jobsSaved.filter((id) => id !== jobId)
        : [...state.jobsSaved, jobId],
    })),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  addTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              section: !task.completed ? 'completed' : 'upcoming',
            }
          : task,
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
}))