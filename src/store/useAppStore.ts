import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockData } from '../data/mockData'
import {
  ApiRequestError,
  authApi,
  projectsApi,
  setUnauthorizedHandler,
  toProject,
  toProjectPayload,
  toUpdatePayload,
  toUserProfile,
  usersApi,
} from '../lib/api'
import { TODAY_ISO } from '../lib/dates'
import type {
  Application,
  ApplicationInput,
  ApplicationStatus,
  AuthState,
  DashboardStats,
  DensityPreference,
  DSAFilters,
  DSAProblem,
  DSAProblemInput,
  DSAProgress,
  NotificationSettings,
  Project,
  ProjectFilters,
  ProjectInput,
  Resume,
  ResumeFilters,
  ResumeInput,
  StudyTask,
  StudyTaskFilters,
  StudyTaskInput,
  ThemePreference,
  UserProfile,
} from '../types'

interface AppState extends AuthState {
  sidebarOpen: boolean
  profile: UserProfile
  notificationSettings: NotificationSettings
  theme: ThemePreference
  density: DensityPreference
  reduceAnimations: boolean
  applications: Application[]
  projects: Project[]
  /** True while the project portfolio is being loaded from the API. */
  projectsLoading: boolean
  /** Last project error, shown on the projects screen. */
  projectsError: string | null
  tasks: StudyTask[]
  studyTaskFilters: StudyTaskFilters
  dashboardStats: DashboardStats
  jobsSaved: string[]
  dsaProblems: DSAProblem[]
  dsaProgress: DSAProgress[]
  dsaFilters: DSAFilters
  projectFilters: ProjectFilters
  resumes: Resume[]
  resumeFilters: ResumeFilters
  /** True while a login or register request is in flight. */
  authPending: boolean
  /** True while a profile save is in flight. */
  profilePending: boolean
  /** Last profile save failure, shown by the profile settings form. */
  profileError: string | null
  /**
   * True once the profile has come from the API at least once.
   *
   * The profile form initializes its fields from the stored profile, so it
   * must not render before there is a real one to initialize from.
   */
  profileLoaded: boolean
  /**
   * Increments every time the profile is (re)loaded from the API.
   *
   * The profile form uses this as its React `key`, so a refreshed profile
   * replaces the form's fields. A save deliberately does not bump it: the
   * form already holds the values it just sent, and remounting on every save
   * would wipe the "saved" confirmation before it could be read.
   */
  profileVersion: number

  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
  /**
   * Verifies the session cookie against `GET /api/auth/me`.
   *
   * Runs once on boot. The result is what the route guards trust, because a
   * value in local storage cannot prove that a session still exists.
   */
  bootstrapSession: () => Promise<void>
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>
  register: (input: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  clearAuthError: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void
  setTheme: (theme: ThemePreference) => void
  setDensity: (density: DensityPreference) => void
  setReduceAnimations: (reduceAnimations: boolean) => void
  resetDemoData: () => Promise<void>
  addApplication: (application: Application) => void
  updateApplication: (id: string, updates: ApplicationInput) => void
  deleteApplication: (id: string) => void
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void
  toggleJobSaved: (jobId: string) => void
  fetchProjects: () => Promise<void>
  createProject: (values: ProjectInput) => Promise<void>
  updateProject: (id: string, values: ProjectInput) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setProjectFilters: (filters: Partial<ProjectFilters>) => void
  addResume: (input: ResumeInput) => void
  updateResume: (id: string, updates: Partial<Resume>) => void
  deleteResume: (id: string) => void
  archiveResume: (id: string) => void
  setCurrentResume: (id: string) => void
  setResumeFilters: (filters: Partial<ResumeFilters>) => void
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

/**
 * Ticket counter for the authentication request race described in
 * `bootstrapSession`. Module scoped on purpose: it is request bookkeeping,
 * not application state, and it must never be persisted.
 */
let authRequestTicket = 0

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  sidebarOpen: false,
  isAuthenticated: false,
  currentUser: null,
  authStatus: 'idle',
  authError: null,
  authPending: false,
  profilePending: false,
  profileError: null,
  profileLoaded: false,
  profileVersion: 0,
  profile: mockData.userProfile,
  notificationSettings: {
    applicationDeadlines: true,
    interviewReminders: true,
    applicationUpdates: true,
    studyReminders: true,
    dailyStudySummary: true,
    weeklyProgressSummary: true,
    jobRecommendations: true,
    resumeReminders: true,
    dsaReminders: true,
  },
  theme: 'light',
  density: 'comfortable',
  reduceAnimations: false,
  applications: mockData.applications,
  projects: [],
  projectsLoading: false,
  projectsError: null,
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
  resumes: mockData.resumes,
  resumeFilters: { search: '', status: 'ALL', fileType: 'ALL', sort: 'NEWEST' },

  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  /**
   * Monotonic counter used to discard stale auth responses.
   *
   * Boot verification and an explicit login can overlap — a visitor may hit
   * "Sign in" while the initial `GET /api/auth/me` is still in flight. Each
   * request takes a ticket and only the newest one is allowed to write state,
   * so a slow boot check can never overwrite a fresh login.
   */
  bootstrapSession: async () => {
    const ticket = ++authRequestTicket
    set({ authStatus: 'loading', authError: null })

    try {
      const { user } = await authApi.me()
      if (ticket !== authRequestTicket) return

      const profile = toUserProfile(user)
      set({
        isAuthenticated: true,
        currentUser: profile,
        authStatus: 'authenticated',
        authError: null,
        // The profile is server-backed now, so the whole thing is synced
        // rather than just the identity fields.
        profile,
        profileLoaded: true,
      })
    } catch {
      if (ticket !== authRequestTicket) return

      // A missing cookie, an expired session, and an unreachable API all mean
      // the same thing to the app: nobody is signed in.
      set({
        isAuthenticated: false,
        currentUser: null,
        authStatus: 'unauthenticated',
      })
    }
  },

  login: async (credentials) => {
    const ticket = ++authRequestTicket
    set({ authPending: true, authError: null })

    try {
      const { user } = await authApi.login(credentials)
      if (ticket !== authRequestTicket) return

      const profile = toUserProfile(user)
      set({
        isAuthenticated: true,
        currentUser: profile,
        authStatus: 'authenticated',
        authError: null,
        // Signing in as a different account must not keep the previous
        // account's profile fields.
        profile,
        profileLoaded: true,
      })
    } catch (error) {
      if (ticket !== authRequestTicket) return

      set({
        isAuthenticated: false,
        currentUser: null,
        authStatus: 'unauthenticated',
        authError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to sign in right now. Please try again.',
      })
      throw error
    } finally {
      if (ticket === authRequestTicket) {
        set({ authPending: false })
      }
    }
  },

  register: async (input) => {
    const ticket = ++authRequestTicket
    set({ authPending: true, authError: null })

    try {
      const { user } = await authApi.register(input)
      if (ticket !== authRequestTicket) return

      const profile = toUserProfile(user)
      set({
        isAuthenticated: true,
        currentUser: profile,
        authStatus: 'authenticated',
        authError: null,
        profile,
        profileLoaded: true,
      })
    } catch (error) {
      if (ticket !== authRequestTicket) return

      set({
        isAuthenticated: false,
        currentUser: null,
        authStatus: 'unauthenticated',
        authError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to create your account right now. Please try again.',
      })
      throw error
    } finally {
      if (ticket === authRequestTicket) {
        set({ authPending: false })
      }
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // The local session is cleared either way: the cookie may already be
      // gone, and the visitor asked to be signed out regardless.
    }

    ++authRequestTicket
    set({
      isAuthenticated: false,
      currentUser: null,
      authStatus: 'unauthenticated',
      authError: null,
    })
  },

  clearAuthError: () => set({ authError: null }),

  /**
   * Reloads the profile from the API.
   *
   * Used when the Settings page opens, so the form always shows the stored
   * values rather than whatever happened to be in local state. Unlike
   * `updateProfile` this does not throw: it is a background refresh, and a
   * failure is reported through `profileError` rather than an exception.
   */
  fetchProfile: async () => {
    set({ profilePending: true, profileError: null })

    try {
      const { user } = await usersApi.getProfile()
      const profile = toUserProfile(user)

      set((state) => ({
        profile,
        currentUser: state.currentUser ? { ...state.currentUser, ...profile } : profile,
        profilePending: false,
        profileLoaded: true,
        // A refreshed profile replaces the form's fields.
        profileVersion: state.profileVersion + 1,
      }))
    } catch (error) {
      set({
        profilePending: false,
        profileError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to load your profile right now.',
      })
    }
  },

  /**
   * Saves the profile to the API.
   *
   * The server is the source of truth: the response carries the stored
   * profile, which replaces the local copy rather than the client's own input
   * being assumed to have been written as sent.
   */
  updateProfile: async (updates) => {
    set({ profilePending: true, profileError: null })

    try {
      const { user } = await usersApi.updateProfile(toUpdatePayload(updates))
      const profile = toUserProfile(user)

      set((state) => ({
        profile,
        currentUser: state.currentUser ? { ...state.currentUser, ...profile } : profile,
        profilePending: false,
        profileError: null,
      }))
    } catch (error) {
      set({
        profilePending: false,
        profileError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to save your profile right now. Please try again.',
      })
      throw error
    }
  },

  updateNotificationSettings: (updates) =>
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...updates },
    })),

  setTheme: (theme) => set({ theme }),
  setDensity: (density) => set({ density }),
  setReduceAnimations: (reduceAnimations) => set({ reduceAnimations }),

  resetDemoData: async () => {
    set({
      applications: [...mockData.applications],
      tasks: [...mockData.studyTasks],
      studyTaskFilters: {
        search: '',
        status: 'ALL',
        priority: 'ALL',
        category: '',
        sort: 'DUE_DATE',
      },
      dashboardStats: mockData.dashboardStats,
      jobsSaved: mockData.jobs.filter((job) => job.saved).map((job) => job.id),
      dsaProblems: [...mockData.dsaProblems],
      dsaProgress: [...mockData.dsaProgress],
      dsaFilters: { search: '', difficulty: 'ALL', topic: '', status: 'ALL' },
      projectFilters: { search: '', status: 'ALL', technology: '' },
      resumes: [...mockData.resumes],
      resumeFilters: { search: '', status: 'ALL', fileType: 'ALL', sort: 'NEWEST' },
    })

    // The portfolio is server-owned now, so it is reloaded rather than reset
    // to mock rows that do not exist in the database.
    await get().fetchProjects()
  },

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

  /**
   * Loads the user's projects from the API.
   *
   * The portfolio is owned by the account, so it is loaded once when the
   * authenticated shell mounts and every screen renders from the store.
   */
  fetchProjects: async () => {
    set({ projectsLoading: true, projectsError: null })

    try {
      const { data } = await projectsApi.list()
      set({ projects: data.map(toProject), projectsLoading: false })
    } catch (error) {
      set({
        projectsLoading: false,
        projectsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to load your projects right now.',
      })
    }
  },

  /**
   * Creates a project and puts it in the store.
   *
   * The API returns the stored project, so the store holds the server's
   * version rather than a local guess.
   */
  createProject: async (values) => {
    set({ projectsError: null })

    try {
      const { data } = await projectsApi.create(toProjectPayload(values))
      set((state) => ({ projects: [toProject(data), ...state.projects] }))
    } catch (error) {
      set({
        projectsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to save the project right now.',
      })
      throw error
    }
  },

  /** Updates a project and replaces it in the store with the stored version. */
  updateProject: async (id, values) => {
    set({ projectsError: null })

    try {
      const { data } = await projectsApi.update(id, toProjectPayload(values))
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? toProject(data) : project,
        ),
      }))
    } catch (error) {
      set({
        projectsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the project right now.',
      })
      throw error
    }
  },

  /** Deletes a project and drops it from the store. */
  deleteProject: async (id) => {
    set({ projectsError: null })

    try {
      await projectsApi.remove(id)
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      }))
    } catch (error) {
      set({
        projectsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to delete the project right now.',
      })
      throw error
    }
  },

  setProjectFilters: (filters) =>
    set((state) => ({ projectFilters: { ...state.projectFilters, ...filters } })),

  addResume: (input) =>
    set((state) => {
      const nextVersion =
        state.resumes.reduce((max, resume) => Math.max(max, resume.version), 0) + 1
      return {
        resumes: [
          {
            id: `resume-${Date.now()}`,
            ...input,
            version: nextVersion,
            status: 'CURRENT' as const,
            uploadedAt: TODAY_ISO,
            updatedAt: TODAY_ISO,
          },
          ...state.resumes.map((resume) =>
            resume.status === 'CURRENT'
              ? { ...resume, status: 'ARCHIVED' as const }
              : resume,
          ),
        ],
      }
    }),

  updateResume: (id, updates) =>
    set((state) => ({
      resumes: state.resumes.map((resume) =>
        resume.id === id ? { ...resume, ...updates, updatedAt: TODAY_ISO } : resume,
      ),
    })),

  deleteResume: (id) =>
    set((state) => {
      const target = state.resumes.find((resume) => resume.id === id)
      if (target?.fileUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(target.fileUrl)
      }
      return {
        resumes: state.resumes.filter((resume) => resume.id !== id),
      }
    }),

  archiveResume: (id) =>
    set((state) => ({
      resumes: state.resumes.map((resume) =>
        resume.id === id ? { ...resume, status: 'ARCHIVED' as const, updatedAt: TODAY_ISO } : resume,
      ),
    })),

  setCurrentResume: (id) =>
    set((state) => ({
      resumes: state.resumes.map((resume) =>
        resume.id === id
          ? { ...resume, status: 'CURRENT' as const, updatedAt: TODAY_ISO }
          : resume.status === 'CURRENT'
            ? { ...resume, status: 'ARCHIVED' as const }
            : resume,
      ),
    })),

  setResumeFilters: (filters) =>
    set((state) => ({ resumeFilters: { ...state.resumeFilters, ...filters } })),

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
    }),
    {
      name: 'careerforge-auth',
      partialize: (state) => ({
        // The session itself lives in an httpOnly cookie and is re-verified
        // against the API on every boot, so these two are only a cached
        // snapshot. The bootstrap check always overwrites them.
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        profile: state.profile,
      }),
    },
  ),
)

/**
 * Any 401 from the API means the session is gone, whatever the request was.
 *
 * Dropping the local session here keeps the UI from showing a signed-in shell
 * over a dead cookie. The next guard evaluation redirects to the login page.
 */
setUnauthorizedHandler(() => {
  useAppStore.setState({
    isAuthenticated: false,
    currentUser: null,
    authStatus: 'unauthenticated',
  })
})