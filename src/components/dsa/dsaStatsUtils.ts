import type { Difficulty, DSAProblem, DSAProgress } from '../../types'

export interface DSAStatsData {
  total: number
  totalSolved: number
  totalUnsolved: number
  solvedByDifficulty: Record<Difficulty, number>
  unsolvedByDifficulty: Record<Difficulty, number>
}

export function computeDSAStats(
  problems: DSAProblem[],
  progress: DSAProgress[],
): DSAStatsData {
  const statusByProblem = new Map(
    progress.map((item) => [item.problemId, item.status]),
  )
  const solvedByDifficulty: Record<Difficulty, number> = { EASY: 0, MEDIUM: 0, HARD: 0 }
  const unsolvedByDifficulty: Record<Difficulty, number> = { EASY: 0, MEDIUM: 0, HARD: 0 }

  for (const problem of problems) {
    const status = statusByProblem.get(problem.id) ?? 'UNSOLVED'
    if (status === 'SOLVED') {
      solvedByDifficulty[problem.difficulty] += 1
    } else {
      unsolvedByDifficulty[problem.difficulty] += 1
    }
  }

  const totalSolved =
    solvedByDifficulty.EASY + solvedByDifficulty.MEDIUM + solvedByDifficulty.HARD

  return {
    total: problems.length,
    totalSolved,
    totalUnsolved: problems.length - totalSolved,
    solvedByDifficulty,
    unsolvedByDifficulty,
  }
}