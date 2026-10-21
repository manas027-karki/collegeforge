/**
 * Development seed.
 *
 * Fills the database with a realistic job board and a DSA catalogue so the
 * app has something to show on a fresh clone. Nothing here is production
 * data: the job listings are fictional and point at example.com.
 *
 * The script is idempotent. Every record has a fixed id, so running it twice
 * updates the same rows rather than creating duplicates.
 *
 * Run it with `npm run prisma:seed`.
 */
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and set it.');
}

// Prisma 7 connects through a driver adapter rather than a bundled engine.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * Fixed ids, so the seed can be re-run safely.
 *
 * The first digit of each block says what the record is, which makes the ids
 * readable in a database client.
 */
const DEMO_USER_ID = '40000000-0000-4000-8000-000000000001';

interface SeedCompany {
  id: string
  name: string
  websiteUrl: string
  description: string
}

interface SeedJob {
  id: string
  companyId: string
  title: string
  location: string
  type: 'INTERNSHIP' | 'FULL_TIME' | 'CONTRACT'
  experience: 'FRESHER' | 'ONE_TO_TWO_YEARS' | 'THREE_TO_FIVE_YEARS'
  skills: string[]
  description: string
  applicationUrl: string
  deadline: string
  postedAt: string
}

interface SeedProblem {
  id: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  topic: string
  url: string
}

const companies: SeedCompany[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Microsoft',
    websiteUrl: 'https://careers.microsoft.com',
    description: 'Builds cloud, productivity and developer tooling used worldwide.',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Amazon',
    websiteUrl: 'https://amazon.jobs',
    description: 'Operates global marketplaces, logistics and streaming.',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Google',
    websiteUrl: 'https://careers.google.com',
    description: 'Search, advertising, cloud and applied research.',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Adobe',
    websiteUrl: 'https://careers.adobe.com',
    description: 'Creative and document software for millions of creators.',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Flipkart',
    websiteUrl: 'https://careers.flipkart.com',
    description: 'India-focused e-commerce and logistics platform.',
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Zoho',
    websiteUrl: 'https://www.zoho.com/careers',
    description: 'Builds productivity software for businesses of every size.',
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    name: 'Razorpay',
    websiteUrl: 'https://razorpay.com/jobs',
    description: 'Payments infrastructure for internet businesses.',
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    name: 'Infosys',
    websiteUrl: 'https://www.infosys.com/careers',
    description: 'Global technology and consulting services.',
  },
  {
    id: '10000000-0000-4000-8000-000000000009',
    name: 'Atlassian',
    websiteUrl: 'https://atlassian.com/company/careers',
    description: 'Team collaboration software used by engineering teams.',
  },
  {
    id: '10000000-0000-4000-8000-000000000010',
    name: 'Freshworks',
    websiteUrl: 'https://www.freshworks.com/careers',
    description: 'Customer support and business software for growing teams.',
  },
  {
    id: '10000000-0000-4000-8000-000000000011',
    name: 'Nexora Labs',
    websiteUrl: 'https://careers.example.com',
    description: 'A fictional analytics company used for the seeded demo data.',
  },
  {
    id: '10000000-0000-4000-8000-000000000012',
    name: 'Orbit Systems',
    websiteUrl: 'https://careers.example.com',
    description: 'A fictional machine learning company used for the seeded demo data.',
  },
]

const jobs: SeedJob[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    companyId: '10000000-0000-4000-8000-000000000001',
    title: 'Software Engineer Intern',
    location: 'Bengaluru, Karnataka',
    type: 'INTERNSHIP',
    experience: 'FRESHER',
    skills: ['C#', 'Azure', 'System Design', 'SQL'],
    description:
      'Join the Azure Cloud team and build resilient services used by millions of developers. You will work closely with a mentor, ship real features and present your work to the wider engineering group.',
    applicationUrl: 'https://careers.microsoft.com/example/software-engineer-intern',
    deadline: '2026-11-25',
    postedAt: '2026-10-02',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    companyId: '10000000-0000-4000-8000-000000000002',
    title: 'SDE Intern',
    location: 'Hyderabad, Telangana',
    type: 'INTERNSHIP',
    experience: 'FRESHER',
    skills: ['Java', 'Data Structures', 'Algorithms', 'AWS'],
    description:
      'Build high-scale software for Amazon Pay with full ownership of features from design to launch. Interns receive bar-raising mentorship and a clear path to a full-time SDE offer.',
    applicationUrl: 'https://amazon.jobs/example/sde-intern',
    deadline: '2026-11-28',
    postedAt: '2026-10-05',
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    companyId: '10000000-0000-4000-8000-000000000003',
    title: 'Software Engineering Intern',
    location: 'Bengaluru, Karnataka',
    type: 'INTERNSHIP',
    experience: 'FRESHER',
    skills: ['Go', 'Kubernetes', 'Distributed Systems', 'C++'],
    description:
      'Work on the infrastructure behind Google Cloud. You will be paired with a senior engineer for the whole internship and own a production service by the end of it.',
    applicationUrl: 'https://careers.google.com/example/software-engineering-intern',
    deadline: '2026-12-02',
    postedAt: '2026-10-07',
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    companyId: '10000000-0000-4000-8000-000000000004',
    title: 'Front End Engineer',
    location: 'Noida, Uttar Pradesh',
    type: 'FULL_TIME',
    experience: 'ONE_TO_TWO_YEARS',
    skills: ['React', 'TypeScript', 'CSS', 'Accessibility'],
    description:
      'Own the web experience of a document product used by millions. You will care about rendering performance, keyboard accessibility and design detail.',
    applicationUrl: 'https://careers.adobe.com/example/front-end-engineer',
    deadline: '2026-11-30',
    postedAt: '2026-10-04',
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    companyId: '10000000-0000-4000-8000-000000000005',
    title: 'Backend Engineer',
    location: 'Bengaluru, Karnataka',
    type: 'FULL_TIME',
    experience: 'ONE_TO_TWO_YEARS',
    skills: ['Java', 'Spring Boot', 'Kafka', 'MySQL'],
    description:
      'Design and build the services behind a marketplace that handles millions of orders a day. Expect close work with product and infrastructure teams.',
    applicationUrl: 'https://careers.flipkart.com/example/backend-engineer',
    deadline: '2026-12-06',
    postedAt: '2026-10-09',
  },
  {
    id: '20000000-0000-4000-8000-000000000006',
    companyId: '10000000-0000-4000-8000-000000000006',
    title: 'Graduate Software Engineer',
    location: 'Chennai, Tamil Nadu',
    type: 'FULL_TIME',
    experience: 'FRESHER',
    skills: ['Python', 'Django', 'PostgreSQL', 'REST'],
    description:
      'A graduate program that rotates you through three teams over a year. You will ship customer-facing features from the first month and get a mentor throughout.',
    applicationUrl: 'https://www.zoho.com/careers/example/graduate-software-engineer',
    deadline: '2026-11-20',
    postedAt: '2026-09-28',
  },
  {
    id: '20000000-0000-4000-8000-000000000007',
    companyId: '10000000-0000-4000-8000-000000000007',
    title: 'Software Development Engineer II',
    location: 'Bengaluru, Karnataka',
    type: 'FULL_TIME',
    experience: 'THREE_TO_FIVE_YEARS',
    skills: ['Go', 'PostgreSQL', 'Event Sourcing', 'gRPC'],
    description:
      'Build the payment rails that make online payments reliable at scale. You will lead a project end to end and mentor two junior engineers.',
    applicationUrl: 'https://razorpay.com/jobs/example/software-development-engineer-ii',
    deadline: '2026-12-12',
    postedAt: '2026-10-01',
  },
  {
    id: '20000000-0000-4000-8000-000000000008',
    companyId: '10000000-0000-4000-8000-000000000008',
    title: 'Full Stack Developer',
    location: 'Pune, Maharashtra',
    type: 'FULL_TIME',
    experience: 'ONE_TO_TWO_YEARS',
    skills: ['React', 'Node.js', 'Angular', 'Azure'],
    description:
      'Work across the stack on a digital platform used by enterprises. The role suits someone who likes owning a feature from the database to the screen.',
    applicationUrl: 'https://www.infosys.com/careers/example/full-stack-developer',
    deadline: '2026-11-18',
    postedAt: '2026-09-25',
  },
  {
    id: '20000000-0000-4000-8000-000000000009',
    companyId: '10000000-0000-4000-8000-000000000009',
    title: 'Site Reliability Engineer',
    location: 'Bengaluru, Karnataka',
    type: 'FULL_TIME',
    experience: 'THREE_TO_FIVE_YEARS',
    skills: ['Kubernetes', 'Terraform', 'Prometheus', 'Go'],
    description:
      'Keep a collaboration platform fast and available. You will spend your time on observability, capacity and the unglamorous work that makes outages rare.',
    applicationUrl: 'https://atlassian.com/company/careers/example/site-reliability-engineer',
    deadline: '2026-12-09',
    postedAt: '2026-10-06',
  },
  {
    id: '20000000-0000-4000-8000-000000000010',
    companyId: '10000000-0000-4000-8000-000000000010',
    title: 'React Developer (Contract)',
    location: 'Remote, India',
    type: 'CONTRACT',
    experience: 'ONE_TO_TWO_YEARS',
    skills: ['React', 'TypeScript', 'Storybook', 'Jest'],
    description:
      'A six-month contract building and hardening the customer support console. Strong component architecture and testing habits are what matter here.',
    applicationUrl: 'https://www.freshworks.com/careers/example/react-developer-contract',
    deadline: '2026-11-15',
    postedAt: '2026-10-10',
  },
  {
    id: '20000000-0000-4000-8000-000000000011',
    companyId: '10000000-0000-4000-8000-000000000010',
    title: 'Backend Developer (Contract)',
    location: 'Remote, India',
    type: 'CONTRACT',
    experience: 'ONE_TO_TWO_YEARS',
    skills: ['Node.js', 'MongoDB', 'Redis', 'Docker'],
    description:
      'A nine-month contract on the ticketing API. You will work on throughput, caching and versioning a public API without breaking existing clients.',
    applicationUrl: 'https://www.freshworks.com/careers/example/backend-developer-contract',
    deadline: '2026-11-22',
    postedAt: '2026-10-03',
  },
  {
    id: '20000000-0000-4000-8000-000000000012',
    companyId: '10000000-0000-4000-8000-000000000012',
    title: 'Data Analyst Intern',
    location: 'Hyderabad, Telangana',
    type: 'INTERNSHIP',
    experience: 'FRESHER',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics'],
    description:
      'Turn messy operational data into dashboards the business actually opens. You will sit with a product team and answer real questions with data.',
    applicationUrl: 'https://careers.example.com/example/data-analyst-intern',
    deadline: '2026-11-12',
    postedAt: '2026-09-30',
  },
  {
    id: '20000000-0000-4000-8000-000000000013',
    companyId: '10000000-0000-4000-8000-000000000012',
    title: 'Machine Learning Engineer',
    location: 'Bengaluru, Karnataka',
    type: 'FULL_TIME',
    experience: 'THREE_TO_FIVE_YEARS',
    skills: ['Python', 'PyTorch', 'MLOps', 'NLP'],
    description:
      'Take models from a notebook to production. You will own the training pipeline, the evaluation strategy and the monitoring that keeps it honest.',
    applicationUrl: 'https://careers.example.com/example/machine-learning-engineer',
    deadline: '2026-12-15',
    postedAt: '2026-10-08',
  },
  {
    id: '20000000-0000-4000-8000-000000000014',
    companyId: '10000000-0000-4000-8000-000000000005',
    title: 'Mobile Engineer (Contract)',
    location: 'Bengaluru, Karnataka',
    type: 'CONTRACT',
    experience: 'ONE_TO_TWO_YEARS',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android'],
    description:
      'A three-month contract on the mobile shopping app. You will work on the checkout flow, where reliability matters more than novelty.',
    applicationUrl: 'https://careers.flipkart.com/example/mobile-engineer-contract',
    deadline: '2026-11-26',
    postedAt: '2026-10-11',
  },
  {
    id: '20000000-0000-4000-8000-000000000015',
    companyId: '10000000-0000-4000-8000-000000000002',
    title: 'Solutions Architect',
    location: 'Bengaluru, Karnataka',
    type: 'FULL_TIME',
    experience: 'THREE_TO_FIVE_YEARS',
    skills: ['AWS', 'System Design', 'Java', 'Consulting'],
    description:
      'Design cloud architectures for enterprise customers and guide them through the build. Half the job is technical and half is explaining.',
    applicationUrl: 'https://amazon.jobs/example/solutions-architect',
    deadline: '2026-12-01',
    postedAt: '2026-09-26',
  },
  {
    id: '20000000-0000-4000-8000-000000000016',
    companyId: '10000000-0000-4000-8000-000000000009',
    title: 'Product Engineer',
    location: 'Remote, India',
    type: 'FULL_TIME',
    experience: 'ONE_TO_TWO_YEARS',
    skills: ['React', 'TypeScript', 'GraphQL', 'Testing'],
    description:
      'Ship product changes end to end, from a conversation with a customer to a deployed feature. The team is small and the feedback loop is short.',
    applicationUrl: 'https://atlassian.com/company/careers/example/product-engineer',
    deadline: '2026-11-29',
    postedAt: '2026-10-12',
  },
  {
    id: '20000000-0000-4000-8000-000000000017',
    companyId: '10000000-0000-4000-8000-000000000003',
    title: 'User Interface Engineer',
    location: 'Gurgaon, Haryana',
    type: 'FULL_TIME',
    experience: 'ONE_TO_TWO_YEARS',
    skills: ['React', 'CSS', 'Design Systems', 'Web Vitals'],
    description:
      'Build the surfaces of a consumer product used daily by millions. You will spend time on the design system, motion and perceived performance.',
    applicationUrl: 'https://careers.google.com/example/user-interface-engineer',
    deadline: '2026-12-04',
    postedAt: '2026-10-13',
  },
  {
    id: '20000000-0000-4000-8000-000000000018',
    companyId: '10000000-0000-4000-8000-000000000007',
    title: 'Frontend Developer Intern',
    location: 'Bengaluru, Karnataka',
    type: 'INTERNSHIP',
    experience: 'FRESHER',
    skills: ['React', 'JavaScript', 'CSS', 'Git'],
    description:
      'A six-month internship on the merchant dashboard. You will build real screens, review real code and ship to real users every week.',
    applicationUrl: 'https://razorpay.com/jobs/example/frontend-developer-intern',
    deadline: '2026-11-19',
    postedAt: '2026-10-14',
  },
  {
    id: '20000000-0000-4000-8000-000000000019',
    companyId: '10000000-0000-4000-8000-000000000004',
    title: 'Developer Evangelist',
    location: 'Remote, India',
    type: 'CONTRACT',
    experience: 'THREE_TO_FIVE_YEARS',
    skills: ['JavaScript', 'Public Speaking', 'Technical Writing', 'APIs'],
    description:
      'A twelve-month contract writing and speaking about developer tooling. You will publish code, record tutorials and talk at meetups.',
    applicationUrl: 'https://careers.adobe.com/example/developer-evangelist',
    deadline: '2026-11-24',
    postedAt: '2026-10-15',
  },
  {
    id: '20000000-0000-4000-8000-000000000020',
    companyId: '10000000-0000-4000-8000-000000000008',
    title: 'Systems Engineer',
    location: 'Hyderabad, Telangana',
    type: 'FULL_TIME',
    experience: 'FRESHER',
    skills: ['Linux', 'Networking', 'Python', 'Shell'],
    description:
      'Keep large distributed systems healthy. You will start with observability, learn the stack, and grow into owning the services you look after.',
    applicationUrl: 'https://www.infosys.com/careers/example/systems-engineer',
    deadline: '2026-12-10',
    postedAt: '2026-10-16',
  },
]

const problems: SeedProblem[] = [
  { id: '30000000-0000-4000-8000-000000000001', title: 'Two Sum', difficulty: 'EASY', topic: 'Arrays', url: 'https://leetcode.com/problems/two-sum' },
  { id: '30000000-0000-4000-8000-000000000002', title: 'Valid Parentheses', difficulty: 'EASY', topic: 'Stack', url: 'https://leetcode.com/problems/valid-parentheses' },
  { id: '30000000-0000-4000-8000-000000000003', title: 'Reverse Linked List', difficulty: 'EASY', topic: 'Linked List', url: 'https://leetcode.com/problems/reverse-linked-list' },
  { id: '30000000-0000-4000-8000-000000000004', title: 'Best Time to Buy and Sell Stock', difficulty: 'EASY', topic: 'Arrays', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock' },
  { id: '30000000-0000-4000-8000-000000000005', title: 'Binary Search', difficulty: 'EASY', topic: 'Searching', url: 'https://leetcode.com/problems/binary-search' },
  { id: '30000000-0000-4000-8000-000000000006', title: 'Merge Two Sorted Lists', difficulty: 'EASY', topic: 'Linked List', url: 'https://leetcode.com/problems/merge-two-sorted-lists' },
  { id: '30000000-0000-4000-8000-000000000007', title: 'Contains Duplicate', difficulty: 'EASY', topic: 'Hashing', url: 'https://leetcode.com/problems/contains-duplicate' },
  { id: '30000000-0000-4000-8000-000000000008', title: 'Maximum Depth of Binary Tree', difficulty: 'EASY', topic: 'Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree' },
  { id: '30000000-0000-4000-8000-000000000009', title: 'Balanced Bracket Check', difficulty: 'EASY', topic: 'Stack', url: 'https://leetcode.com/problems/balanced-brackets' },
  { id: '30000000-0000-4000-8000-000000000010', title: 'Climbing Stairs', difficulty: 'EASY', topic: 'Dynamic Programming', url: 'https://leetcode.com/problems/climbing-stairs' },
  { id: '30000000-0000-4000-8000-000000000011', title: 'Two Sum II', difficulty: 'MEDIUM', topic: 'Arrays', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted' },
  { id: '30000000-0000-4000-8000-000000000012', title: 'Add Two Numbers', difficulty: 'MEDIUM', topic: 'Linked List', url: 'https://leetcode.com/problems/add-two-numbers' },
  { id: '30000000-0000-4000-8000-000000000013', title: 'Longest Substring Without Repeating Characters', difficulty: 'MEDIUM', topic: 'Strings', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters' },
  { id: '30000000-0000-4000-8000-000000000014', title: 'Group Anagrams', difficulty: 'MEDIUM', topic: 'Hashing', url: 'https://leetcode.com/problems/group-anagrams' },
  { id: '30000000-0000-4000-8000-000000000015', title: 'Product of Array Except Self', difficulty: 'MEDIUM', topic: 'Arrays', url: 'https://leetcode.com/problems/product-of-array-except-self' },
  { id: '30000000-0000-4000-8000-000000000016', title: 'Binary Tree Level Order Traversal', difficulty: 'MEDIUM', topic: 'Binary Tree', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal' },
  { id: '30000000-0000-4000-8000-000000000017', title: 'Coin Change', difficulty: 'MEDIUM', topic: 'Dynamic Programming', url: 'https://leetcode.com/problems/coin-change' },
  { id: '30000000-0000-4000-8000-000000000018', title: 'Course Schedule', difficulty: 'MEDIUM', topic: 'Graph', url: 'https://leetcode.com/problems/course-schedule' },
  { id: '30000000-0000-4000-8000-000000000019', title: 'Number of Islands', difficulty: 'MEDIUM', topic: 'Graph', url: 'https://leetcode.com/problems/number-of-islands' },
  { id: '30000000-0000-4000-8000-000000000020', title: 'Merge K Sorted Lists', difficulty: 'HARD', topic: 'Heap', url: 'https://leetcode.com/problems/merge-k-sorted-lists' },
  { id: '30000000-0000-4000-8000-000000000021', title: 'Trapping Rain Water', difficulty: 'HARD', topic: 'Stack', url: 'https://leetcode.com/problems/trapping-rain-water' },
  { id: '30000000-0000-4000-8000-000000000022', title: 'Serialize and Deserialize Binary Tree', difficulty: 'HARD', topic: 'Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree' },
  { id: '30000000-0000-4000-8000-000000000023', title: 'Word Search II', difficulty: 'HARD', topic: 'Backtracking', url: 'https://leetcode.com/problems/word-search-ii' },
  { id: '30000000-0000-4000-8000-000000000024', title: 'Minimum Cost Path in a Grid', difficulty: 'HARD', topic: 'Dynamic Programming', url: 'https://leetcode.com/problems/minimum-cost-path-in-a-grid' },
]

/** The account the seeded reference data belongs to. */
const DEMO_USER = {
  id: DEMO_USER_ID,
  name: 'Demo User',
  email: 'demo@careerforge.app',
  passwordHash: 'not-a-real-hash-seed-only',
}

const toUtcDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`)

async function main(): Promise<void> {
  await prisma.user.upsert({
    where: { id: DEMO_USER.id },
    update: { name: DEMO_USER.name, email: DEMO_USER.email },
    create: DEMO_USER,
  })

  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {
        name: company.name,
        websiteUrl: company.websiteUrl,
        description: company.description,
      },
      create: {
        id: company.id,
        name: company.name,
        websiteUrl: company.websiteUrl,
        description: company.description,
      },
    })
  }

  for (const job of jobs) {
    const data = {
      companyId: job.companyId,
      title: job.title,
      location: job.location,
      type: job.type,
      experience: job.experience,
      skills: job.skills,
      description: job.description,
      applicationUrl: job.applicationUrl,
      deadline: toUtcDate(job.deadline),
      postedAt: toUtcDate(job.postedAt),
    }

    await prisma.job.upsert({ where: { id: job.id }, update: data, create: { id: job.id, ...data } })
  }

  for (const problem of problems) {
    const data = {
      title: problem.title,
      difficulty: problem.difficulty,
      topic: problem.topic,
      platform: 'LEETCODE' as const,
      url: problem.url,
    }

    await prisma.dSAProblem.upsert({
      where: { id: problem.id },
      update: data,
      create: { id: problem.id, userId: DEMO_USER.id, ...data },
    })
  }

  console.log(
    `Seeded ${companies.length} companies, ${jobs.length} jobs and ${problems.length} DSA problems.`,
  )
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })
