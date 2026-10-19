/**
 * Public surface of the API layer.
 *
 * Feature code imports from here rather than reaching into individual modules,
 * so the transport can be swapped or mocked without touching call sites.
 */
export { API_BASE_URL, ApiRequestError, apiClient, apiRequest, setUnauthorizedHandler } from './client'
export { authApi, toUserProfile, type AuthUser } from './auth'
