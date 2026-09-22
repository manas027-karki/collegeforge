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
  ProjectFilters,
  ProjectInput,
  StudyTask,
  StudyTaskFilters,
  StudyTaskInput,
} from '../types'

interface AppState {
  sidebarOpen: boolean
  applications: Application[]
  projects: Project[]
  tasks: StudyTask[]
  studyTaskFilters: StudyTaskFilters
  dashboardStats: DashboardStats
  jobsSaved: string[]
  dsaProblems: DSAProblem[]
  dsaProgress: DSAProgress[]
  dsaFilters: DSAFilters
  projectFilters: ProjectFilters

  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
  addApplication: (application: Application) => void
  updateApplication: (id: string, updates: ApplicationInput) => void
  deleteApplication: (id: string) => void
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void
  toggleJobSaved: (jobId: string) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: ProjectInput) => void
  deleteProject: (id: string) => void
  setProjectFilters: (filters: Partial<ProjectFilters>) => void
  addStudyTask: (task: StudyTask) => void
  updateStudyTask: (id: string, updates: StudyTaskInput) => void
  deleteStudyTask: (id: string) => void
  toggleStudyTask: (id: string) => void
  setStudyTaskFilters: (filters: Partial<StudyTaskFilters>) => void
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
  studyTaskFilters: {
    search: '',
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    sort: 'DUE_DATE',
  },
  dashboardStats: mockData.dashboardStats,
  jobsSaved: mockData.jobs.filter((job) => job.saved).map((job) => job.id),
  dsaProblems: mockData.dsaProblems,
  dsaProgress: mockData.dsaProgress,
  dsaFilters: { search: '', difficulty: 'ALL', topic: 'ALL', status: 'ALL' },
  projectFilters: { search: '', status: 'ALL', technology: 'ALL' },

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

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, ...updates, updatedAt: TODAY_ISO }
          : project,
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    })),

  setProjectFilters: (filters) =>
    set((state) => ({ projectFilters: { ...state.projectFilters, ...filters } })),

  addStudyTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),

  updateStudyTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      ),
    })),

  deleteStudyTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),

  toggleStudyTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED',
            }
          : task,
      ),
    })),

  setStudyTaskFilters: (filters) =>
    set((state) => ({
      studyTaskFilters: { ...state.studyTaskFilters, ...filters },
    })),

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