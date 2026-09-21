import { create } from 'zustand'
import { mockData } from '../data/mockData'
import { TODAY_ISO } from '../lib/dates'
import type {
  Application,
  ApplicationInput,
  ApplicationStatus,
  DashboardStats,
  DSAFilters,
  DSAProblem,
  DSAProblemInput,
  DSAProgress,
  Project,
  StudyTask,
} from '../types'

interface AppState {
  sidebarOpen: boolean
  applications: Application[]
  projects: Project[]
  tasks: StudyTask[]
  dashboardStats: DashboardStats
  jobsSaved: string[]
  dsaProblems: DSAProblem[]
  dsaProgress: DSAProgress[]
  dsaFilters: DSAFilters

  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
  addApplication: (application: Application) => void
  updateApplication: (id: string, updates: ApplicationInput) => void
  deleteApplication: (id: string) => void
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void
  toggleJobSaved: (jobId: string) => void
  addProject: (project: Project) => void
  addTask: (task: StudyTask) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  addDSAProblem: (input: DSAProblemInput) => void
  updateDSAProblem: (id: string, updates: DSAProblemInput) => void
  deleteDSAProblem: (id: string) => void
  markProblemSolved: (problemId: string) => void
  markProblemUnsolved: (problemId: string) => void
  recordAttempt: (problemId: string) => void
  setDSAFilters: (filters: Partial<DSAFilters>) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  applications: mockData.applications,
  projects: mockData.projects,
  tasks: mockData.studyTasks,
  dashboardStats: mockData.dashboardStats,
  jobsSaved: mockData.jobs.filter((job) => job.saved).map((job) => job.id),
  dsaProblems: mockData.dsaProblems,
  dsaProgress: mockData.dsaProgress,
  dsaFilters: { search: '', difficulty: 'ALL', topic: 'ALL', status: 'ALL' },

  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addApplication: (application) =>
    set((state) => ({
      applications: [application, ...state.applications],
    })),

  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((application) =>
        application.id === id ? { ...application, ...updates } : application,
      ),
    })),

  deleteApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((application) => application.id !== id),
    })),

  updateApplicationStatus: (id, status) =>
    set((state) => ({
      applications: state.applications.map((application) =>
        application.id === id
          ? application.status === status
            ? application
            : { ...application, status }
          : application,
      ),
    })),

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

  addDSAProblem: (input) =>
    set((state) => {
      const id = `dsa-${Date.now()}`
      return {
        dsaProblems: [{ id, ...input }, ...state.dsaProblems],
        dsaProgress: [{ problemId: id, status: 'UNSOLVED', attempts: 0 }, ...state.dsaProgress],
      }
    }),

  updateDSAProblem: (id, updates) =>
    set((state) => ({
      dsaProblems: state.dsaProblems.map((problem) =>
        problem.id === id ? { ...problem, ...updates } : problem,
      ),
    })),

  deleteDSAProblem: (id) =>
    set((state) => ({
      dsaProblems: state.dsaProblems.filter((problem) => problem.id !== id),
      dsaProgress: state.dsaProgress.filter((item) => item.problemId !== id),
    })),

  markProblemSolved: (problemId) =>
    set((state) => ({
      dsaProgress: state.dsaProgress.map((item) =>
        item.problemId === problemId
          ? { ...item, status: 'SOLVED', lastSolvedAt: TODAY_ISO }
          : item,
      ),
    })),

  markProblemUnsolved: (problemId) =>
    set((state) => ({
      dsaProgress: state.dsaProgress.map((item) =>
        item.problemId === problemId
          ? { ...item, status: 'UNSOLVED' }
          : item,
      ),
    })),

  recordAttempt: (problemId) =>
    set((state) => ({
      dsaProgress: state.dsaProgress.map((item) =>
        item.problemId === problemId
          ? { ...item, attempts: item.attempts + 1 }
          : item,
      ),
    })),

  setDSAFilters: (filters) =>
    set((state) => ({ dsaFilters: { ...state.dsaFilters, ...filters } })),
}))