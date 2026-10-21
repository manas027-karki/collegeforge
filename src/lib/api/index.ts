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
