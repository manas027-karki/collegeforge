/**
 * HTTP client for the CareerForge API.
 *
 * The backend answers every request with a single envelope:
 *
 *   success -> { success: true,  message: string, ...fields }
 *   failure -> { success: false, message: string, code?: string, details?: unknown }
 *
 * `apiRequest` unwraps that envelope and converts every failure into an
 * `ApiRequestError`, so callers never have to inspect a raw axios error and
 * never have to guess whether `error.response` exists.
 *
 * Authentication is cookie-based, so the client always sends credentials.
 * The session cookie is `httpOnly`, which is exactly why the browser is the
 * only thing that can carry it — this module never touches the token itself.
 */
import axios, { type AxiosRequestConfig } from 'axios'

/**
 * Base URL of the API.
 *
 * In development this is empty on purpose: the Vite dev server proxies `/api`
 * to the backend, so the browser stays on a single origin. That removes CORS
 * from the equation entirely and makes the session cookie behave like a
 * same-site request.
 *
 * A production build has to point at the deployed API, so `VITE_API_URL` wins
 * when it is set.
 */
const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim()

export const API_BASE_URL =
  configuredBaseUrl ||
  (import.meta.env.DEV ? '' : 'http://localhost:5000')

/** The origin the browser is actually on. Used in error messages. */
export const CURRENT_ORIGIN =
  typeof window === 'undefined' ? 'the browser' : window.location.origin

/**
 * A failed API call, normalized across transport, HTTP, and validation errors.
 *
 * `message` is always safe to show to a user: the backend owns the wording and
 * keeps internals out of it in production.
 */
export class ApiRequestError extends Error {
  /** HTTP status, or `0` when the request never reached the server. */
  readonly status: number
  /** Machine-readable code from the API, e.g. `NOT_FOUND`. */
  readonly code?: string
  /** Field-level validation details, when the API provided them. */
  readonly details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** True when the failure was caused by a missing or expired session. */
  get isUnauthorized(): boolean {
    return this.status === 401
  }

  /** True when the API could not be reached at all. */
  get isNetworkError(): boolean {
    return this.status === 0
  }
}

/** The success envelope plus whatever fields the endpoint returned. */
export type ApiSuccess<TFields extends object> = {
  success: true
  message: string
} & TFields

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // The session lives in an httpOnly cookie, so it has to ride along with
  // every request. Without this the API would never see the session.
  withCredentials: true,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Called whenever the API answers 401, so the app can drop to the login
 * screen instead of leaving a half-signed-in UI on screen.
 *
 * Registered by the store rather than imported by it, which keeps the
 * dependency pointing one way: store -> api, never api -> store.
 */
let unauthorizedHandler: (() => void) | null = null

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)

/** Body shape the API uses for failures. */
interface ApiErrorBody {
  success?: false
  message?: string
  code?: string
  details?: unknown
}

/**
 * Converts anything thrown by axios into an `ApiRequestError`.
 *
 * A transport failure (server down, DNS, CORS, timeout) has no response, so
 * it becomes status `0` with a message that tells the user what actually
 * happened instead of a generic "Request failed".
 */
const toApiRequestError = (error: unknown): ApiRequestError => {
  if (error instanceof ApiRequestError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0

    if (status === 0) {
      // No response at all. The two usual causes are a backend that is not
      // running and a CORS rejection, and the browser reports both the same
      // way, so the message names both.
      return new ApiRequestError(
        `Cannot reach the CareerForge API from ${CURRENT_ORIGIN}. ` +
          'Check that the backend is running, and that this origin is listed ' +
          'in the backend\'s FRONTEND_URL.',
        0,
        'NETWORK_ERROR',
      )
    }

    const body = error.response?.data as ApiErrorBody | undefined

    return new ApiRequestError(
      body?.message ?? 'The request failed. Please try again.',
      status,
      body?.code,
      body?.details,
    )
  }

  return new ApiRequestError('Something went wrong. Please try again.', 0, 'UNKNOWN_ERROR')
}

/**
 * Performs a request and returns the unwrapped success envelope.
 *
 * @typeParam TFields - The extra fields the endpoint returns, e.g. `{ user: AuthUser }`.
 */
export const apiRequest = async <TFields extends object>(
  config: AxiosRequestConfig,
): Promise<ApiSuccess<TFields>> => {
  try {
    const response = await apiClient.request<ApiSuccess<TFields>>(config)
    return response.data
  } catch (error) {
    throw toApiRequestError(error)
  }
}
