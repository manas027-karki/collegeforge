/**
 * Public surface of the API layer.
 *
 * Feature code imports from here rather than reaching into individual modules,
 * so the transport can be swapped or mocked without touching call sites.
 */
export { API_BASE_URL, ApiRequestError, apiClient, apiRequest, setUnauthorizedHandler } from './client'
export { authApi, type LoginCredentials, type RegisterInput } from './auth'
export { toUserProfile, type ApiUser } from './user'
export { usersApi, toUpdatePayload, type UpdateProfilePayload } from './users'
export {
  projectsApi,
  toProject,
  toProjectPayload,
  type ApiProject,
  type ProjectPayload,
} from './projects'
export {
  studyTasksApi,
  toStudyTask,
  toStudyTaskPayload,
  type ApiStudyTask,
  type StudyTaskPayload,
} from './studyTasks'
export {
  dsaApi,
  toDSAProblemPayload,
  toDSAState,
  type ApiDSAProblem,
  type ApiDSAProgress,
  type DSAProblemPayload,
  type DSAProgressPayload,
} from './dsa'
export {
  resumesApi,
  toResume,
  type ApiResume,
  type CreateResumePayload,
  type UpdateResumePayload,
} from './resumes'
export {
  jobsApi,
  toJob,
  type ApiCompany,
  type ApiExperienceLevel,
  type ApiJob,
  type ApiJobMeta,
  type ApiJobType,
  type JobQuery,
} from './jobs'
export {
  applicationsApi,
  toApplication,
  toApplicationPayload,
  type ApiApplication,
  type ApiApplicationJob,
  type CreateApplicationPayload,
  type UpdateApplicationPayload,
} from './applications'
