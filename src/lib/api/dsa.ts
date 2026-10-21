/**
 * DSA tracker endpoints, mirroring `backend/src/routes/dsa.routes.ts`.
 *
 *   GET    /api/dsa/problems            list the user's problems, with progress
 *   POST   /api/dsa/problems            add a problem
 *   GET    /api/dsa/problems/:id        read one problem
 *   PATCH  /api/dsa/problems/:id        update a problem, partially
 *   DELETE /api/dsa/problems/:id        delete a problem
 *   PATCH  /api/dsa/progress/:problemId update the user's progress on it
 */
import { apiRequest } from './client'
import type {
  DSAProblem,
  DSAProblemInput,
  DSAProgress,
  Difficulty,
  DSAPlatform,
  ProblemStatus,
} from '../../types'

/**
 * A problem as the API returns it, with the signed-in user's progress on it.
 */
export interface ApiDSAProblem {
  id: string
  title: string
  difficulty: Difficulty
  topic: string
  platform: DSAPlatform
  url: string
  createdAt: string
  updatedAt: string
  progress: {
    id: string
    status: ProblemStatus
    attempts: number
    lastSolvedAt: string | null
  } | null
}

/** A progress row as the API returns it. */
export interface ApiDSAProgress {
  id: string
  problemId: string
  status: ProblemStatus
  attempts: number
  lastSolvedAt: string | null
}

/** The shape the API accepts when writing a problem. */
export interface DSAProblemPayload {
  title?: string
  difficulty?: Difficulty
  topic?: string
  platform?: DSAPlatform
  url?: string
}

/**
 * The shape the API accepts when updating progress.
 *
 * `incrementAttempts` is a flag rather than a count because the server owns
 * the counter. Sending a count would mean reading it first, and two devices
 * recording an attempt at the same time would lose one between them.
 */
export interface DSAProgressPayload {
  status?: ProblemStatus
  incrementAttempts?: boolean
}

/**
 * Splits the API's combined list into the two arrays the app keeps.
 *
 * The store holds problems and progress separately, and the API returns
 * them together so the screen needs a single request.
 */
export const toDSAState = (
  problems: ApiDSAProblem[],
): { problems: DSAProblem[]; progress: DSAProgress[] } => ({
  problems: problems.map((problem) => ({
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    topic: problem.topic,
    platform: problem.platform,
    url: problem.url,
  })),
  progress: problems.flatMap((problem) =>
    problem.progress
      ? [
          {
            problemId: problem.id,
            status: problem.progress.status,
            attempts: problem.progress.attempts,
            lastSolvedAt: problem.progress.lastSolvedAt ?? undefined,
          },
        ]
      : [],
  ),
})

/** Converts the form's values into the API's problem payload. */
export const toDSAProblemPayload = (values: DSAProblemInput): DSAProblemPayload => ({
  title: values.title,
  difficulty: values.difficulty,
  topic: values.topic,
  platform: values.platform,
  url: values.url,
})

export const dsaApi = {
  /** Lists the user's problems, each with their progress. */
  list: () => apiRequest<{ data: ApiDSAProblem[] }>({ method: 'GET', url: '/api/dsa/problems' }),

  /** Adds a problem. */
  create: (payload: DSAProblemPayload) =>
    apiRequest<{ data: ApiDSAProblem }>({
      method: 'POST',
      url: '/api/dsa/problems',
      data: payload,
    }),

  /** Applies a partial update. */
  update: (id: string, payload: DSAProblemPayload) =>
    apiRequest<{ data: ApiDSAProblem }>({
      method: 'PATCH',
      url: `/api/dsa/problems/${id}`,
      data: payload,
    }),

  /** Deletes a problem. */
  remove: (id: string) =>
    apiRequest<Record<string, never>>({
      method: 'DELETE',
      url: `/api/dsa/problems/${id}`,
    }),

  /**
   * Updates the signed-in user's progress on a problem.
   *
   * The client sends what changed, not the whole row: the status is a set
   * operation, and the attempt count is an increment the server applies.
   */
  setProgress: (problemId: string, payload: DSAProgressPayload) =>
    apiRequest<{ data: ApiDSAProgress }>({
      method: 'PATCH',
      url: `/api/dsa/progress/${problemId}`,
      data: payload,
    }),
}
