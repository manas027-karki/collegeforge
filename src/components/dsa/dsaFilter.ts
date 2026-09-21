import type { DSAFilters, DSAProblem, DSAProgress } from '../../types'

export function filterDSAProblems(
  problems: DSAProblem[],
  progress: DSAProgress[],
  filters: DSAFilters,
): DSAProblem[] {
  const statusByProblem = new Map(
    progress.map((item) => [item.problemId, item.status]),
  )
  const query = filters.search.trim().toLowerCase()

  return problems.filter((problem) => {
    const matchesSearch =
      query === '' ||
      problem.title.toLowerCase().includes(query) ||
      problem.topic.toLowerCase().includes(query)
    const matchesDifficulty =
      filters.difficulty === 'ALL' || problem.difficulty === filters.difficulty
    const matchesTopic = filters.topic === 'ALL' || problem.topic === filters.topic
    const matchesStatus =
      filters.status === 'ALL' ||
      (statusByProblem.get(problem.id) ?? 'UNSOLVED') === filters.status

    return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus
  })
}