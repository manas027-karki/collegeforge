import { TODAY_ISO } from '../../lib/dates'
import type {
  StudyTask,
  StudyTaskSort,
  TaskPriority,
  TaskStatus,
} from '../../types'
import { TASK_PRIORITY_ORDER } from './studyMeta'

export interface StudyTaskFiltersState {
  search: string
  status: TaskStatus | 'ALL'
  priority: TaskPriority | 'ALL'
  category: string
  sort: StudyTaskSort
}

function sortStudyTasks(tasks: StudyTask[], sort: StudyTaskSort): StudyTask[] {
  const copy = [...tasks]
  switch (sort) {
    case 'PRIORITY':
      return copy.sort(
        (a, b) => TASK_PRIORITY_ORDER[b.priority] - TASK_PRIORITY_ORDER[a.priority],
      )
    case 'CREATED_DATE':
      return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'DUE_DATE':
    default:
      return copy.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }
}

export function filterStudyTasks(
  tasks: StudyTask[],
  filters: StudyTaskFiltersState,
): StudyTask[] {
  const query = filters.search.trim().toLowerCase()

  const filtered = tasks.filter((task) => {
    const matchesSearch =
      query === '' ||
      task.title.toLowerCase().includes(query) ||
      (task.description ?? '').toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)
    const matchesStatus =
      filters.status === 'ALL' || task.status === filters.status
    const matchesPriority =
      filters.priority === 'ALL' || task.priority === filters.priority
    const matchesCategory =
      filters.category === 'ALL' || task.category === filters.category

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  return sortStudyTasks(filtered, filters.sort)
}

export interface GroupedTasks {
  overdue: StudyTask[]
  today: StudyTask[]
  upcoming: StudyTask[]
  completed: StudyTask[]
}

export function groupStudyTasks(tasks: StudyTask[]): GroupedTasks {
  const grouped: GroupedTasks = {
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
  }

  for (const task of tasks) {
    if (task.status === 'COMPLETED') {
      grouped.completed.push(task)
    } else if (task.dueDate === TODAY_ISO) {
      grouped.today.push(task)
    } else if (task.dueDate < TODAY_ISO) {
      grouped.overdue.push(task)
    } else {
      grouped.upcoming.push(task)
    }
  }

  return grouped
}