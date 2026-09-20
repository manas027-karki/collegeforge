import type {
  Activity,
  AnalyticsData,
  Application,
  ApplicationStatus,
  DashboardStats,
  DSAProblem,
  DSAStats,
  Deadline,
  Job,
  Project,
  StudyTask,
  TaskPriority,
  TaskSection,
} from '../types'

export const user = {
  name: 'Manas',
  fullName: 'Manas Kumar',
  role: 'Student · CSE',
  initials: 'MK',
  email: 'manas@example.com',
}

const salaryNeutralJobs: Job[] = [
  {
    id: 'job-msft-swe',
    company: 'Microsoft',
    title: 'Software Engineer Intern',
    location: 'Bengaluru, Karnataka',
    type: 'Internship',
    experience: 'Fresher',
    deadline: '2026-09-25',
    postedAt: '2026-09-10',
    skills: ['React', 'TypeScript', 'C#', 'System Design'],
    saved: true,
  },
  {
    id: 'job-amzn-sde',
    company: 'Amazon',
    title: 'SDE Intern',
    location: 'Hyderabad, Telangana',
    type: 'Internship',
    experience: 'Fresher',
    deadline: '2026-09-28',
    postedAt: '2026-09-12',
    skills: ['Java', 'Data Structures', 'Algorithms', 'AWS'],
    saved: false,
  },
  {
    id: 'job-google-swe',
    company: 'Google',
    title: 'Software Engineer, Summer Intern',
    location: 'Bengaluru, Karnataka',
    type: 'Internship',
    experience: 'Fresher',
    deadline: '2026-10-08',
    postedAt: '2026-09-15',
    skills: ['Python', 'Algorithms', 'Distributed Systems'],
    saved: false,
  },
  {
    id: 'job-adobe-fe',
    company: 'Adobe',
    title: 'Frontend Intern',
    location: 'Noida, Uttar Pradesh',
    type: 'Internship',
    experience: 'Fresher',
    deadline: '2026-10-02',
    postedAt: '2026-09-11',
    skills: ['JavaScript', 'React', 'CSS', 'Web Accessibility'],
    saved: true,
  },
  {
    id: 'job-atlassian-be',
    company: 'Atlassian',
    title: 'Backend Engineering Intern',
    location: 'Bengaluru, Karnataka',
    type: 'Internship',
    experience: 'Fresher',
    deadline: '2026-10-05',
    postedAt: '2026-09-09',
    skills: ['Go', 'Java', 'REST APIs', 'PostgreSQL'],
    saved: false,
  },
  {
    id: 'job-infosys-eng',
    company: 'Infosys',
    title: 'Systems Engineer Trainee',
    location: 'Pune, Maharashtra',
    type: 'Full-time',
    experience: 'Fresher',
    deadline: '2026-10-15',
    postedAt: '2026-09-05',
    skills: ['Java', 'SQL', 'Spring Boot', 'React'],
    saved: false,
  },
]

const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'Saved',
  'Applied',
  'OA',
  'Interview',
  'Selected',
  'Rejected',
]

const APPLICATION_COUNTS: Record<ApplicationStatus, number> = {
  Saved: 12,
  Applied: 24,
  OA: 8,
  Interview: 5,
  Selected: 1,
  Rejected: 10,
}

const appCompanies = [
  'Microsoft',
  'Amazon',
  'Google',
  'Adobe',
  'Atlassian',
  'Infosys',
  'Stripe',
  'Uber',
  'Flipkart',
  'Arcesium',
  'Zomato',
  'Netflix',
]

const appRoles = [
  'Software Engineer Intern',
  'SDE Intern',
  'Backend Intern',
  'Frontend Intern',
  'Data Engineer Intern',
  'ML Intern',
  'Product Engineer',
  'Platform Intern',
]

const appLocations = [
  'Bengaluru',
  'Hyderabad',
  'Gurugram',
  'Pune',
  'Mumbai',
  'Remote',
  'Noida',
  'Chennai',
]

function buildApplications(): Application[] {
  const apps: Application[] = []
  let id = 1
  const appliedOn = '2026-09-18'
  const olderAppliedOn = '2026-09-02'

  APPLICATION_STATUS_ORDER.forEach((status) => {
    const count = APPLICATION_COUNTS[status]
    for (let i = 0; i < count; i += 1) {
      const company = appCompanies[id % appCompanies.length]
      const role = appRoles[(id * 3) % appRoles.length]
      apps.push({
        id: `app-${id}`,
        company,
        role,
        location: appLocations[(id * 5) % appLocations.length],
        status,
        appliedDate: status === 'Saved' ? '' : i % 3 === 0 ? olderAppliedOn : appliedOn,
        deadline: status === 'Saved' ? '2026-10-20' : undefined,
      })
      id += 1
    }
  })

  return apps
}

const dsaStats: DSAStats = {
  easy: 85,
  medium: 42,
  hard: 8,
  total: 135,
  goal: 200,
  monthly: [
    { month: 'Jan', solved: 20 },
    { month: 'Feb', solved: 35 },
    { month: 'Mar', solved: 52 },
    { month: 'Apr', solved: 70 },
    { month: 'May', solved: 91 },
    { month: 'Jun', solved: 110 },
    { month: 'Jul', solved: 135 },
  ],
}

const dsaTopics: Array<{ topic: string; solved: number }> = [
  { topic: 'Arrays', solved: 34 },
  { topic: 'Strings', solved: 21 },
  { topic: 'Linked List', solved: 15 },
  { topic: 'Stack', solved: 10 },
  { topic: 'Queue', solved: 6 },
  { topic: 'Binary Tree', solved: 14 },
  { topic: 'BST', solved: 7 },
  { topic: 'Heap', solved: 5 },
  { topic: 'Graph', solved: 8 },
  { topic: 'Dynamic Programming', solved: 9 },
  { topic: 'Greedy', solved: 4 },
  { topic: 'Backtracking', solved: 2 },
]

const dsaProblems: DSAProblem[] = [
  { id: 'dsa-1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', status: 'Solved', lastSolved: '2026-09-19' },
  { id: 'dsa-2', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', status: 'Solved', lastSolved: '2026-09-17' },
  { id: 'dsa-3', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', status: 'Solved', lastSolved: '2026-09-13' },
  { id: 'dsa-4', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Arrays', status: 'Solved', lastSolved: '2026-09-10' },
  { id: 'dsa-5', title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Arrays', status: 'Solved', lastSolved: '2026-09-08' },
  { id: 'dsa-6', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings', status: 'Solved', lastSolved: '2026-09-02' },
  { id: 'dsa-7', title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Binary Tree', status: 'In Progress', lastSolved: '2026-09-15' },
  { id: 'dsa-8', title: 'Top K Frequent Elements', difficulty: 'Medium', topic: 'Heap', status: 'In Progress', lastSolved: '2026-09-12' },
  { id: 'dsa-9', title: 'LRU Cache', difficulty: 'Medium', topic: 'Linked List', status: 'Not Started' },
  { id: 'dsa-10', title: '3Sum', difficulty: 'Medium', topic: 'Arrays', status: 'Not Started' },
  { id: 'dsa-11', title: 'Number of Islands', difficulty: 'Medium', topic: 'Graph', status: 'Not Started' },
  { id: 'dsa-12', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Binary Tree', status: 'Not Started' },
  { id: 'dsa-13', title: 'Word Ladder', difficulty: 'Hard', topic: 'Graph', status: 'Not Started' },
  { id: 'dsa-14', title: 'Minimum Window Substring', difficulty: 'Hard', topic: 'Strings', status: 'Not Started' },
]

const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'CareerForge',
    description:
      'All-in-one student career management platform tracking DSA progress, applications and interview prep.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    status: 'In Progress',
    lastUpdated: '2026-09-19',
    githubUrl: 'https://github.com/mock/careerforge',
    liveUrl: 'https://careerforge.example.com',
  },
  {
    id: 'proj-2',
    name: 'EduShayak',
    description:
      'Learning management platform for rural students with offline-first course delivery and progress tracking.',
    technologies: ['React', 'Firebase', 'PWA'],
    status: 'Completed',
    lastUpdated: '2026-08-30',
    githubUrl: 'https://github.com/mock/edushayak',
    liveUrl: 'https://edushayak.example.com',
  },
  {
    id: 'proj-3',
    name: 'CodeProof',
    description:
      'DSA practice tracker that syncs solved problems and streaks to a personal analytics dashboard.',
    technologies: ['Next.js', 'PostgreSQL', 'Prisma'],
    status: 'Completed',
    lastUpdated: '2026-07-22',
    githubUrl: 'https://github.com/mock/codeproof',
  },
  {
    id: 'proj-4',
    name: 'Sahyatri',
    description:
      'Community ride-sharing web app connecting daily commuters with verified peers along the same route.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Mapbox'],
    status: 'Completed',
    lastUpdated: '2026-06-14',
    githubUrl: 'https://github.com/mock/sahyatri',
    liveUrl: 'https://sahyatri.example.com',
  },
]

const task = (
  id: string,
  title: string,
  priority: TaskPriority,
  dueDate: string,
  section: TaskSection,
  completed = false,
): StudyTask => {
  return { id, title, priority, dueDate, completed, section }
}

const studyTasks: StudyTask[] = [
  task('task-1', 'Solve 3 Array problems', 'High', '2026-09-20', 'today'),
  task('task-2', 'Revise SQL Joins', 'Medium', '2026-09-20', 'today'),
  task('task-3', 'Learn React useEffect', 'Medium', '2026-09-20', 'today'),
  task('task-4', 'Apply to 3 internships', 'High', '2026-09-21', 'upcoming'),
  task('task-5', 'Complete Node.js API tutorial', 'Low', '2026-09-22', 'upcoming'),
  task('task-6', 'Revise OS concepts', 'Low', '2026-09-24', 'upcoming'),
  task('task-7', 'Complete System Design basics', 'Medium', '2026-09-18', 'completed', true),
  task('task-8', 'Mock interview practice', 'High', '2026-09-16', 'completed', true),
]

const deadlines: Deadline[] = [
  { id: 'dl-1', company: 'Microsoft', role: 'Software Engineer Intern', deadline: '2026-09-25' },
  { id: 'dl-2', company: 'Amazon', role: 'SDE Intern', deadline: '2026-09-28' },
  { id: 'dl-3', company: 'Adobe', role: 'Frontend Intern', deadline: '2026-10-02' },
]

const activities: Activity[] = [
  { id: 'act-1', title: 'Solved Two Sum', type: 'dsa', timestamp: '2 hours ago' },
  { id: 'act-2', title: 'Added CareerForge project', type: 'project', timestamp: 'Yesterday' },
  { id: 'act-3', title: 'Applied to Microsoft', type: 'application', timestamp: 'Yesterday' },
  { id: 'act-4', title: 'Completed React Hooks task', type: 'task', timestamp: '2 days ago' },
]

const dashboardStats: DashboardStats = {
  dsaProblems: 135,
  applications: 24,
  interviews: 5,
  projects: 4,
}

const analyticsData: AnalyticsData = {
  applicationsOverTime: [
    { month: 'Mar', applications: 4 },
    { month: 'Apr', applications: 9 },
    { month: 'May', applications: 12 },
    { month: 'Jun', applications: 18 },
    { month: 'Jul', applications: 21 },
    { month: 'Aug', applications: 24 },
    { month: 'Sep', applications: 30 },
  ],
  studyConsistency: [
    { week: 'W1', tasksCompleted: 3, tasksPlanned: 5 },
    { week: 'W2', tasksCompleted: 5, tasksPlanned: 6 },
    { week: 'W3', tasksCompleted: 4, tasksPlanned: 6 },
    { week: 'W4', tasksCompleted: 6, tasksPlanned: 6 },
    { week: 'W5', tasksCompleted: 5, tasksPlanned: 7 },
  ],
  projectsCompleted: [
    { month: 'May', projects: 1 },
    { month: 'Jun', projects: 2 },
    { month: 'Jul', projects: 3 },
    { month: 'Aug', projects: 3 },
    { month: 'Sep', projects: 4 },
  ],
}

export const mockData = {
  user,
  jobs: salaryNeutralJobs,
  applications: buildApplications(),
  applicationCounts: APPLICATION_COUNTS,
  dsaStats,
  dsaTopics,
  dsaProblems,
  projects,
  studyTasks,
  deadlines,
  activities,
  dashboardStats,
  analyticsData,
}