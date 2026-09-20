export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'OA'
  | 'Interview'
  | 'Selected'
  | 'Rejected'

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
}

export interface Application {
  id: string
  company: string
  role: string
  location: string
  status: ApplicationStatus
  appliedDate: string
  deadline?: string
}

export interface DSAProblem {
  id: string
  title: string
  difficulty: Difficulty
  topic: string
  status: 'Solved' | 'In Progress' | 'Not Started'
  lastSolved?: string
}

export interface DSAStats {
  easy: number
  medium: number
  hard: number
  total: number
  goal: number
  monthly: Array<{ month: string; solved: number }>
}

export type ProjectStatus = 'Completed' | 'In Progress' | 'Planning'

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  status: ProjectStatus
  lastUpdated: string
  githubUrl?: string
  liveUrl?: string
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