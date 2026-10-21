/**
 * Job board business logic.
 *
 * A job is shared reference data: it belongs to a company, and every visitor
 * sees the same list. Nothing here is scoped to a user, which is what makes
 * the endpoint public.
 *
 * The list is filtered, sorted and paginated in the database rather than in
 * memory, so the result stays correct and fast as the catalogue grows.
 */
import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';
import type { JobQuery } from '../validation/job.schemas';

/**
 * A job with its company expanded.
 *
 * The company is included rather than joined client-side, so the response is
 * one round trip and the client never has to know the shape of the relation.
 */
export interface JobWithCompany {
  id: string;
  title: string;
  location: string;
  type: string;
  experience: string;
  skills: string[];
  description: string;
  applicationUrl: string | null;
  deadline: Date | null;
  postedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
  };
}

/** The page of jobs, plus what the filter dropdowns need. */
export interface JobListResult {
  data: JobWithCompany[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    /** Every location in the catalogue, so the dropdown is never page-bound. */
    locations: string[];
  };
}

/** The company fields the job board exposes. */
const companySelect = {
  id: true,
  name: true,
  logoUrl: true,
  websiteUrl: true,
} satisfies Prisma.CompanySelect;

/**
 * Turns the query into a Prisma filter.
 *
 * The search is case-insensitive and matches the title, the company name or
 * any of the listed skills, because that is what someone typing a job search
 * expects.
 */
const buildWhere = (query: JobQuery): Prisma.JobWhereInput => {
  const filters: Prisma.JobWhereInput[] = [];

  if (query.search) {
    filters.push({
      OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { skills: { has: query.search } },
        { company: { name: { contains: query.search, mode: 'insensitive' } } },
      ],
    });
  }

  if (query.location) {
    filters.push({ location: { equals: query.location, mode: 'insensitive' } });
  }

  if (query.type) {
    filters.push({ type: query.type });
  }

  if (query.experience) {
    filters.push({ experience: query.experience });
  }

  if (query.company) {
    filters.push({ company: { name: { contains: query.company, mode: 'insensitive' } } });
  }

  return filters.length > 0 ? { AND: filters } : {};
};

/** The order the results come back in. */
const buildOrderBy = (sort: JobQuery['sort']): Prisma.JobOrderByWithRelationInput[] =>
  sort === 'deadline'
    ? [{ deadline: { sort: 'asc', nulls: 'last' } }, { postedAt: 'desc' }]
    : [{ postedAt: 'desc' }];

/**
 * Lists the job board.
 *
 * The locations in the metadata come from the whole catalogue rather than the
 * current page, so the filter dropdown keeps offering every location even
 * when the first page is full of postings from one city.
 */
export const listJobs = async (query: JobQuery): Promise<JobListResult> => {
  const where = buildWhere(query);

  const [total, jobs, locations] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { company: { select: companySelect } },
    }),
    prisma.job.findMany({
      distinct: ['location'],
      select: { location: true },
      orderBy: { location: 'asc' },
    }),
  ]);

  return {
    data: jobs as JobWithCompany[],
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      locations: locations.map((entry) => entry.location),
    },
  };
};

/** Reads one job with its company. */
export const findJobById = async (id: string): Promise<JobWithCompany | null> => {
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: { select: companySelect } },
  });

  return job as JobWithCompany | null;
};
