export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type ProblemStatus = 'SOLVED' | 'UNSOLVED'
export type DSAPlatform = 'LEETCODE' | 'OTHER'

export interface DSAFilters {
  search: string
  difficulty: Difficulty | 'ALL'
  topic: string
  status: ProblemStatus | 'ALL'
}

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'OA'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'

export type JobType = 'Full-time' | 'Internship' | 'Contract'
export type ExperienceLevel = 'Fresher' | '1-2 years' | '3-5 years'

export interface Job {
  id: string
  company: string
  title: string
  location: string
  type: JobType
  experience: ExperienceLevel
  deadline: string
  postedAt: string
  skills: string[]
  saved: boolean
  description: string
  applicationUrl?: string
}

export interface Application {
  id: string
  jobId: string
  company: string
  role: string
  location: string
  status: ApplicationStatus
  appliedAt: string
  deadline?: string
  notes?: string
}

export type ApplicationInput = Omit<Application, 'id'>

export interface DSAProblem {
  id: string
  title: string
  difficulty: Difficulty
  topic: string
  platform: DSAPlatform
  url: string
}

export type DSAProblemInput = Omit<DSAProblem, 'id'>

export interface DSAProgress {
  problemId: string
  status: ProblemStatus
  attempts: number
  lastSolvedAt?: string
}

export interface DSAStats {
  easy: number
  medium: number
  hard: number
  total: number
  goal: number
  monthly: Array<{ month: string; solved: number }>
}

export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  status: ProjectStatus
  githubUrl?: string
  liveUrl?: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>

export interface ProjectFilters {
  search: string
  status: ProjectStatus | 'ALL'
  technology: string
}

export type TaskPriority = 'High' | 'Medium' | 'Low'
export type TaskSection = 'today' | 'upcoming' | 'completed'

export interface StudyTask {
  id: string
  title: string
  priority: TaskPriority
  dueDate: string
  completed: boolean
  section: TaskSection
}

export interface Deadline {
  id: string
  company: string
  role: string
  deadline: string
}

export type ActivityType = 'dsa' | 'project' | 'application' | 'task'

export interface Activity {
  id: string
  title: string
  type: ActivityType
  timestamp: string
}

export interface DashboardStats {
  dsaProblems: number
  applications: number
  interviews: number
  projects: number
}

export interface AnalyticsData {
  applicationsOverTime: Array<{ month: string; applications: number }>
  studyConsistency: Array<{ week: string; tasksCompleted: number; tasksPlanned: number }>
  projectsCompleted: Array<{ month: string; projects: number }>
}