import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockData } from '../data/mockData'
import {
  ApiRequestError,
  applicationsApi,
  authApi,
  dsaApi,
  jobsApi,
  projectsApi,
  resumesApi,
  setUnauthorizedHandler,
  toApplication,
  toApplicationPayload,
  toDSAProblemPayload,
  toDSAState,
  toJob,
  toProject,
  toProjectPayload,
  toResume,
  toStudyTask,
  toStudyTaskPayload,
  toUpdatePayload,
  toUserProfile,
  studyTasksApi,
  usersApi,
  type UpdateResumePayload,
} from '../lib/api'
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
  Job,
  JobFilters,
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
  /** True while the applications are being loaded from the API. */
  applicationsLoading: boolean
  /** Last application error, shown on the applications screen. */
  applicationsError: string | null
  projects: Project[]
  /** True while the project portfolio is being loaded from the API. */
  projectsLoading: boolean
  /** Last project error, shown on the projects screen. */
  projectsError: string | null
  tasks: StudyTask[]
  /** True while the study planner is being loaded from the API. */
  studyTasksLoading: boolean
  /** Last study task error, shown on the planner screen. */
  studyTasksError: string | null
  studyTaskFilters: StudyTaskFilters
  dashboardStats: DashboardStats
  /** The job board page currently loaded from the API. */
  jobs: Job[]
  /** The page metadata the job board returned. */
  jobsMeta: {
    page: number
    pageSize: number
    total: number
    totalAll: number
    totalPages: number
    locations: string[]
  }
  /** True while the job board is being loaded. */
  jobsLoading: boolean
  /** Last job board error, shown on the jobs screen. */
  jobsError: string | null
  /** The job board's filter state. */
  jobFilters: JobFilters
  /** The ids of the jobs the user has saved. */
  jobsSaved: string[]
  dsaProblems: DSAProblem[]
  dsaProgress: DSAProgress[]
  /** True while the DSA tracker is being loaded from the API. */
  dsaLoading: boolean
  /** Last DSA error, shown on the tracker screen. */
  dsaError: string | null
  dsaFilters: DSAFilters
  projectFilters: ProjectFilters
  resumes: Resume[]
  /** True while the resume list is being loaded from the API. */
  resumesLoading: boolean
  /** Last resume error, shown on the resume screen. */
  resumesError: string | null
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
  fetchApplications: () => Promise<void>
  addApplication: (application: ApplicationInput) => Promise<void>
  updateApplication: (id: string, updates: ApplicationInput) => Promise<void>
  deleteApplication: (id: string) => Promise<void>
  updateApplicationStatus: (id: string, status: ApplicationStatus) => Promise<void>
  toggleJobSaved: (jobId: string) => void
  fetchJobs: () => Promise<void>
  setJobFilters: (filters: Partial<JobFilters>) => void
  fetchProjects: () => Promise<void>
  createProject: (values: ProjectInput) => Promise<void>
  updateProject: (id: string, values: ProjectInput) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setProjectFilters: (filters: Partial<ProjectFilters>) => void
  addResume: (input: ResumeInput, localFileUrl?: string) => Promise<void>
  updateResume: (id: string, updates: UpdateResumePayload) => Promise<void>
  deleteResume: (id: string) => Promise<void>
  archiveResume: (id: string) => Promise<void>
  setCurrentResume: (id: string) => Promise<void>
  fetchResumes: () => Promise<void>
  setResumeFilters: (filters: Partial<ResumeFilters>) => void
  fetchStudyTasks: () => Promise<void>
  createStudyTask: (values: StudyTaskInput) => Promise<void>
  updateStudyTask: (id: string, values: StudyTaskInput) => Promise<void>
  deleteStudyTask: (id: string) => Promise<void>
  toggleStudyTask: (id: string) => Promise<void>
  setStudyTaskFilters: (filters: Partial<StudyTaskFilters>) => void
  addDSAProblem: (input: DSAProblemInput) => Promise<void>
  updateDSAProblem: (id: string, updates: DSAProblemInput) => Promise<void>
  deleteDSAProblem: (id: string) => Promise<void>
  markProblemSolved: (problemId: string) => Promise<void>
  markProblemUnsolved: (problemId: string) => Promise<void>
  recordAttempt: (problemId: string) => Promise<void>
  fetchDSAProblems: () => Promise<void>
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
  applications: [],
  applicationsLoading: false,
  applicationsError: null,
  projects: [],
  projectsLoading: false,
  projectsError: null,
  tasks: [],
  studyTasksLoading: false,
  studyTasksError: null,
  studyTaskFilters: {
    search: '',
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    sort: 'DUE_DATE',
  },
  dashboardStats: mockData.dashboardStats,
  jobs: [],
  jobsMeta: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalAll: 0,
    totalPages: 1,
    locations: [],
  },
  jobsLoading: false,
  jobsError: null,
  jobFilters: {
    search: '',
    location: 'all',
    type: 'all',
    sort: 'newest',
    page: 1,
  },
  jobsSaved: mockData.jobs.filter((job) => job.saved).map((job) => job.id),
  dsaProblems: [],
  dsaProgress: [],
  dsaLoading: false,
  dsaError: null,
  dsaFilters: { search: '', difficulty: 'ALL', topic: 'ALL', status: 'ALL' },
  projectFilters: { search: '', status: 'ALL', technology: 'ALL' },
  resumes: [],
  resumesLoading: false,
  resumesError: null,
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

    // The portfolio, study plan and applications are server-owned now, so they are
    // reloaded rather than reset to mock rows that do not exist in the
    // database.
    await get().fetchProjects()
    await get().fetchStudyTasks()
    await get().fetchApplications()
  },

  /**
   * Loads the user's applications from the API.
   */
  fetchApplications: async () => {
    set({ applicationsLoading: true, applicationsError: null })

    try {
      const { data } = await applicationsApi.list()
      set({ applications: data.map(toApplication), applicationsLoading: false })
    } catch (error) {
      set({
        applicationsLoading: false,
        applicationsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to load your applications right now.',
      })
    }
  },

  /**
   * Creates an application and puts it in the store.
   */
  addApplication: async (values) => {
    set({ applicationsError: null })

    try {
      const { data } = await applicationsApi.create(toApplicationPayload(values))
      set((state) => ({ applications: [toApplication(data), ...state.applications] }))
    } catch (error) {
      set({
        applicationsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to save the application right now.',
      })
      throw error
    }
  },

  /**
   * Updates an application and replaces it in the store with the stored version.
   */
  updateApplication: async (id, values) => {
    set({ applicationsError: null })

    try {
      const { data } = await applicationsApi.update(id, toApplicationPayload(values))
      set((state) => ({
        applications: state.applications.map((application) =>
          application.id === id ? toApplication(data) : application,
        ),
      }))
    } catch (error) {
      set({
        applicationsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the application right now.',
      })
      throw error
    }
  },

  /**
   * Deletes an application and drops it from the store.
   */
  deleteApplication: async (id) => {
    set({ applicationsError: null })

    try {
      await applicationsApi.remove(id)
      set((state) => ({
        applications: state.applications.filter((application) => application.id !== id),
      }))
    } catch (error) {
      set({
        applicationsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to delete the application right now.',
      })
      throw error
    }
  },

  /**
   * Updates just the status of an application.
   */
  updateApplicationStatus: async (id, status) => {
    set({ applicationsError: null })

    try {
      const { data } = await applicationsApi.updateStatus(id, status)
      set((state) => ({
        applications: state.applications.map((application) =>
          application.id === id ? toApplication(data) : application,
        ),
      }))
    } catch (error) {
      set({
        applicationsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the application status right now.',
      })
      throw error
    }
  },

  /**
   * Loads the job board from the API.
   *
   * The filters are sent to the server, which does the searching, filtering
   * and paging, so the client never has to hold the whole catalogue.
   */
  fetchJobs: async () => {
    set({ jobsLoading: true, jobsError: null })

    const filters = get().jobFilters

    try {
      const { data, meta } = await jobsApi.list({
        search: filters.search.trim() || undefined,
        // 'all' is the dropdown's "no filter" value, not a real location.
        location: filters.location === 'all' ? undefined : filters.location,
        type: filters.type === 'all' ? undefined : filters.type,
        sort: filters.sort,
        page: filters.page,
        pageSize: 20,
      })

      set((state) => ({
        jobs: data.map((job) => toJob(job, state.jobsSaved.includes(job.id))),
        jobsMeta: meta,
        jobsLoading: false,
      }))
    } catch (error) {
      set({
        jobsLoading: false,
        jobsError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to load the job board right now.',
      })
    }
  },

  /**
   * Updates the job board filters and reloads.
   *
   * Changing a filter resets to the first page, because staying on page
   * three of a result set that just shrank shows nothing.
   */
  setJobFilters: (filters: Partial<JobFilters>) => {
    set((state) => ({
      jobFilters: {
        ...state.jobFilters,
        ...filters,
        page: filters.page ?? (filters.search || filters.location || filters.type ? 1 : state.jobFilters.page),
      },
    }))

    void get().fetchJobs()
  },

  toggleJobSaved: (jobId) =>
    set((state) => ({
      jobsSaved: state.jobsSaved.includes(jobId)
        ? state.jobsSaved.filter((id) => id !== jobId)
        : [...state.jobsSaved, jobId],
      // The saved flag is part of the job the card renders, so it has to be
      // updated in place as well as in the saved list.
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, saved: !job.saved } : job,
      ),
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

  /**
   * Loads the user's resumes from the API.
   *
   * The portfolio of resume versions belongs to the account, so it is loaded
   * once when the authenticated shell mounts.
   */
  fetchResumes: async () => {
    set({ resumesLoading: true, resumesError: null })

    try {
      const { data } = await resumesApi.list()
      set({ resumes: data.map((resume) => toResume(resume)), resumesLoading: false })
    } catch (error) {
      set({
        resumesLoading: false,
        resumesError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to load your resumes right now.',
      })
    }
  },

  /**
   * Creates a resume and makes it the current one.
   *
   * The server assigns the version number and archives the previous current
   * resume, so the client does not have to reproduce either rule.
   *
   * `localFileUrl` is the blob URL for the file the user just picked. It
   * only works for this session, so it is never sent to the server; it is
   * kept locally so the user can download the file they just uploaded.
   */
  addResume: async (input, localFileUrl) => {
    set({ resumesError: null })

    try {
      const { data } = await resumesApi.create({
        fileName: input.fileName,
        targetRole: input.targetRole,
        fileType: input.fileType,
        fileSize: input.fileSize ?? null,
      })

      set((state) => {
        const created = toResume(data, localFileUrl)

        return {
          resumes: [
            created,
            // The server archived the previous current resume; mirror that
            // so the two do not disagree on screen.
            ...state.resumes.map((resume) =>
              resume.status === 'CURRENT'
                ? { ...resume, status: 'ARCHIVED' as const }
                : resume,
            ),
          ],
        }
      })
    } catch (error) {
      set({
        resumesError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to save the resume right now.',
      })
      throw error
    }
  },

  /** Updates a resume and replaces it in the store with the stored version. */
  updateResume: async (id, updates) => {
    set({ resumesError: null })

    try {
      const { data } = await resumesApi.update(id, updates)
      set((state) => ({
        resumes: state.resumes.map((resume) =>
          resume.id === id
            ? toResume(data, resume.fileUrl?.startsWith('blob:') ? resume.fileUrl : undefined)
            : resume,
        ),
      }))
    } catch (error) {
      set({
        resumesError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the resume right now.',
      })
      throw error
    }
  },

  /**
   * Makes a resume the current one and archives the others.
   *
   * The server does both halves; the client sends one request and replaces
   * the list with what came back.
   */
  setCurrentResume: async (id) => {
    set({ resumesError: null })

    try {
      const { data } = await resumesApi.setCurrent(id)
      const current = toResume(data)

      set((state) => ({
        resumes: state.resumes.map((resume) =>
          resume.id === id
            ? current
            : resume.status === 'CURRENT'
              ? { ...resume, status: 'ARCHIVED' as const }
              : resume,
        ),
      }))
    } catch (error) {
      set({
        resumesError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the resume right now.',
      })
      throw error
    }
  },

  /** Archives a resume. */
  archiveResume: async (id) => {
    set({ resumesError: null })

    try {
      const { data } = await resumesApi.update(id, { status: 'ARCHIVED' })
      set((state) => ({
        resumes: state.resumes.map((resume) =>
          resume.id === id
            ? toResume(data, resume.fileUrl?.startsWith('blob:') ? resume.fileUrl : undefined)
            : resume,
        ),
      }))
    } catch (error) {
      set({
        resumesError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the resume right now.',
      })
      throw error
    }
  },

  /** Deletes a resume and drops it from the store. */
  deleteResume: async (id) => {
    set({ resumesError: null })

    try {
      await resumesApi.remove(id)
      set((state) => {
        const target = state.resumes.find((resume) => resume.id === id)
        if (target?.fileUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(target.fileUrl)
        }
        return {
          resumes: state.resumes.filter((resume) => resume.id !== id),
        }
      })
    } catch (error) {
      set({
        resumesError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to delete the resume right now.',
      })
      throw error
    }
  },

  setResumeFilters: (filters) =>
    set((state) => ({ resumeFilters: { ...state.resumeFilters, ...filters } })),

  /**
   * Loads the user's study tasks from the API.
   *
   * The planner is owned by the account, so it is loaded once when the
   * authenticated shell mounts and every screen renders from the store.
   */
  fetchStudyTasks: async () => {
    set({ studyTasksLoading: true, studyTasksError: null })

    try {
      const { data } = await studyTasksApi.list()
      set({ tasks: data.map(toStudyTask), studyTasksLoading: false })
    } catch (error) {
      set({
        studyTasksLoading: false,
        studyTasksError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to load your study tasks right now.',
      })
    }
  },

  /** Creates a study task and puts it in the store. */
  createStudyTask: async (values) => {
    set({ studyTasksError: null })

    try {
      const { data } = await studyTasksApi.create(toStudyTaskPayload(values))
      set((state) => ({ tasks: [toStudyTask(data), ...state.tasks] }))
    } catch (error) {
      set({
        studyTasksError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to save the task right now.',
      })
      throw error
    }
  },

  /** Updates a study task and replaces it in the store with the stored version. */
  updateStudyTask: async (id, values) => {
    set({ studyTasksError: null })

    try {
      const { data } = await studyTasksApi.update(id, toStudyTaskPayload(values))
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? toStudyTask(data) : task)),
      }))
    } catch (error) {
      set({
        studyTasksError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the task right now.',
      })
      throw error
    }
  },

  /**
   * Flips a task between To Do and Completed.
   *
   * The server decides the new status, so the client does not have to know
   * what the current one is.
   */
  toggleStudyTask: async (id) => {
    set({ studyTasksError: null })

    try {
      const { data } = await studyTasksApi.toggle(id)
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? toStudyTask(data) : task)),
      }))
    } catch (error) {
      set({
        studyTasksError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the task right now.',
      })
      throw error
    }
  },

  /** Deletes a study task and drops it from the store. */
  deleteStudyTask: async (id) => {
    set({ studyTasksError: null })

    try {
      await studyTasksApi.remove(id)
      set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }))
    } catch (error) {
      set({
        studyTasksError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to delete the task right now.',
      })
      throw error
    }
  },

  setStudyTaskFilters: (filters) =>
    set((state) => ({
      studyTaskFilters: { ...state.studyTaskFilters, ...filters },
    })),

  /**
   * Loads the user's problems and their progress from the API.
   *
   * The two travel together in one request and are split back apart here,
   * because the store keeps them separately.
   */
  fetchDSAProblems: async () => {
    set({ dsaLoading: true, dsaError: null })

    try {
      const { data } = await dsaApi.list()
      const { problems, progress } = toDSAState(data)
      set({ dsaProblems: problems, dsaProgress: progress, dsaLoading: false })
    } catch (error) {
      set({
        dsaLoading: false,
        dsaError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to load your problems right now.',
      })
    }
  },

  /** Adds a problem and puts it in the store. */
  addDSAProblem: async (input) => {
    set({ dsaError: null })

    try {
      const { data } = await dsaApi.create(toDSAProblemPayload(input))
      set((state) => ({
        dsaProblems: [
          {
            id: data.id,
            title: data.title,
            difficulty: data.difficulty,
            topic: data.topic,
            platform: data.platform,
            url: data.url,
          },
          ...state.dsaProblems,
        ],
      }))
    } catch (error) {
      set({
        dsaError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to add the problem right now.',
      })
      throw error
    }
  },

  /** Updates a problem and replaces it in the store with the stored version. */
  updateDSAProblem: async (id, updates) => {
    set({ dsaError: null })

    try {
      const { data } = await dsaApi.update(id, toDSAProblemPayload(updates))
      set((state) => ({
        dsaProblems: state.dsaProblems.map((problem) =>
          problem.id === id
            ? {
                id: data.id,
                title: data.title,
                difficulty: data.difficulty,
                topic: data.topic,
                platform: data.platform,
                url: data.url,
              }
            : problem,
        ),
      }))
    } catch (error) {
      set({
        dsaError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the problem right now.',
      })
      throw error
    }
  },

  /** Deletes a problem and drops it, and its progress, from the store. */
  deleteDSAProblem: async (id) => {
    set({ dsaError: null })

    try {
      await dsaApi.remove(id)
      set((state) => ({
        dsaProblems: state.dsaProblems.filter((problem) => problem.id !== id),
        dsaProgress: state.dsaProgress.filter((item) => item.problemId !== id),
      }))
    } catch (error) {
      set({
        dsaError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to delete the problem right now.',
      })
      throw error
    }
  },

  /**
   * Marks a problem solved.
   *
   * The server stamps the time it was solved, so the client does not have to
   * send a date and cannot send a wrong one.
   */
  markProblemSolved: async (problemId) => {
    set({ dsaError: null })

    try {
      const { data } = await dsaApi.setProgress(problemId, { status: 'SOLVED' })
      set((state) => ({
        dsaProgress: state.dsaProgress.some((item) => item.problemId === problemId)
          ? state.dsaProgress.map((item) =>
              item.problemId === problemId
                ? {
                    ...item,
                    status: data.status,
                    attempts: data.attempts,
                    lastSolvedAt: data.lastSolvedAt ?? undefined,
                  }
                : item,
            )
          : [
              ...state.dsaProgress,
              {
                problemId,
                status: data.status,
                attempts: data.attempts,
                lastSolvedAt: data.lastSolvedAt ?? undefined,
              },
            ],
      }))
    } catch (error) {
      set({
        dsaError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the problem right now.',
      })
    }
  },

  /** Marks a problem unsolved. The time it was last solved is kept. */
  markProblemUnsolved: async (problemId) => {
    set({ dsaError: null })

    try {
      const { data } = await dsaApi.setProgress(problemId, { status: 'UNSOLVED' })
      set((state) => ({
        dsaProgress: state.dsaProgress.some((item) => item.problemId === problemId)
          ? state.dsaProgress.map((item) =>
              item.problemId === problemId
                ? {
                    ...item,
                    status: data.status,
                    attempts: data.attempts,
                    lastSolvedAt: data.lastSolvedAt ?? undefined,
                  }
                : item,
            )
          : [
              ...state.dsaProgress,
              {
                problemId,
                status: data.status,
                attempts: data.attempts,
                lastSolvedAt: data.lastSolvedAt ?? undefined,
              },
            ],
      }))
    } catch (error) {
      set({
        dsaError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to update the problem right now.',
      })
    }
  },

  /**
   * Records an attempt on a problem.
   *
   * The server owns the counter, so the client asks for an increment rather
   * than sending a count it read a moment ago.
   */
  recordAttempt: async (problemId) => {
    set({ dsaError: null })

    try {
      const { data } = await dsaApi.setProgress(problemId, { incrementAttempts: true })
      set((state) => ({
        dsaProgress: state.dsaProgress.some((item) => item.problemId === problemId)
          ? state.dsaProgress.map((item) =>
              item.problemId === problemId
                ? {
                    ...item,
                    status: data.status,
                    attempts: data.attempts,
                    lastSolvedAt: data.lastSolvedAt ?? undefined,
                  }
                : item,
            )
          : [
              ...state.dsaProgress,
              {
                problemId,
                status: data.status,
                attempts: data.attempts,
                lastSolvedAt: data.lastSolvedAt ?? undefined,
              },
            ],
      }))
    } catch (error) {
      set({
        dsaError:
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to record the attempt right now.',
      })
    }
  },

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
        // The saved job ids are the user's own state and there is no
        // endpoint for them yet, so they are kept in the browser. They
        // survive a refresh this way.
        jobsSaved: state.jobsSaved,
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