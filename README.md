<p align="center">
  <img src="public/favicon.svg" width="72" alt="CareerForge" />
</p>

<h1 align="center">CareerForge</h1>

<p align="center">
  A modern career-management platform for students — DSA progress, job applications, projects, and study planning in one clean SaaS-style workspace.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6-blue?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white&style=flat-square" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-purple?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/Recharts-3-red?style=flat-square" alt="Recharts" />
</p>

---

## What is CareerForge?

CareerForge is a **frontend application** built to manage the entire student job-search workflow in one place:

- 🧑‍💻 **Track DSA/LeetCode practice** across topics and difficulty
- 💼 **Find and apply to jobs** with a realistic job board
- 📋 **Manage applications** through a Kanban hiring pipeline (Saved → Applied → OA → Interview → Selected → Rejected)
- 🗂️ **Showcase a project portfolio**
- 📅 **Plan daily study sessions**
- 📊 **Understand progress** with interactive analytics charts

> **Note:** The UI is complete and still runs entirely on realistic **mock data** (`src/data/mockData.ts`).
> An Express + PostgreSQL backend now exists in `backend/` as a foundation for the next
> phases; only `GET /api/health` is live, so nothing in the UI has switched over yet.

---

## ✨ Features

| Area | What you get |
|---|---|
| **Dashboard** | Personal greeting, key statistics, DSA progress chart, application pipeline, upcoming deadlines, and recent activity |
| **Jobs** | Searchable job board with filters for location, job type, and experience |
| **Applications** | Kanban-style tracker with an "Add Application" flow |
| **DSA Tracker** | Problem list with difficulty/topic breakdown, search, and filters |
| **Projects** | Portfolio cards with GitHub & live demo links |
| **Study Planner** | Today / upcoming / completed task lists with priorities and due dates |
| **Resume** | Version management with upload, view, download, and delete |
| **Analytics** | Recharts visualizations of progress, applications, consistency, and projects |
| **Settings** | Profile, account, notifications, appearance, and integrations |

## 🛠️ Tech Stack

- **React 19** — functional components, hooks
- **TypeScript** — strict typing throughout
- **Vite 8** — instant dev server and optimized production builds
- **Tailwind CSS 4** — design system with a single primary accent color
- **React Router 7** — client-side routing with layout routes
- **Zustand 5** — lightweight global state
- **Recharts 3** — responsive, clean data visualizations
- **Lucide React** — consistent iconography

## 🚀 Getting Started

CareerForge is a two-part repository: the **frontend** (this Vite app, at the repo root) and the
**backend** (Express API, in `backend/`). They are installed and run
separately. The frontend directory was intentionally left at the repository root, so there is no
`cd frontend` step here — the commands below reflect the actual layout.

### Frontend

**Prerequisites:** [Node.js](https://nodejs.org/) v20.19+ (developed on v25) and npm.

```bash
# 1. Clone the repository
git clone https://github.com/manas027-karki/collegeforge.git
cd careerforge

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Available scripts (frontend)

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) then bundle for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint code-quality checks |

---

### PostgreSQL (required by the backend)

The backend needs a running PostgreSQL server and a `careerforge` database:

```text
PostgreSQL  ->  careerforge database  ->  Prisma  ->  Express
```

1. Install [PostgreSQL](https://www.postgresql.org/download/) 14+ (Windows installer, macOS `brew install postgresql`, or your distro's package manager).
2. Start the server, then create the database:

   ```bash
   createdb -U postgres careerforge
   ```

3. Put your real password in `backend/.env` (see the table below). Never commit it — `backend/.env`
   is already git-ignored and only `backend/.env.example` is tracked.

Example connection string (replace `YOUR_PASSWORD`):

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/careerforge"
```

### 🖥️ Backend (`backend/`)

A production-oriented Express 5 + TypeScript API that will replace the mock data layer. The
frontend still runs fully on mock data; only the foundation and `GET /api/health` exist today.

**Prerequisites:** Node.js v20.19+ (developed on v25) and a reachable PostgreSQL server (above).

```bash
cd backend
npm install                 # also runs `prisma generate` via postinstall
cp .env.example .env        # then set your real PostgreSQL password
npm run prisma:migrate      # creates the database schema (needs a reachable DATABASE_URL)
npm run dev                 # http://localhost:5000
```

### Tech stack

- **Express 5** with a thin `app` / `server` split (`app.ts` builds the app, `server.ts` owns the
  listener and graceful shutdown)
- **TypeScript 7** in strict mode (`tsc --noEmit` clean), CommonJS output in `dist/`
- **Prisma 7** with PostgreSQL, generating a typed client into `backend/src/generated/prisma`
- **Zod**-validated environment configuration that fails fast on boot
- **helmet**, **cors** (locked to `FRONTEND_URL` with credentials), **cookie-parser**,
  `express.json` body limits, and a single `{ success, message, ... }` response envelope

### Environment variables

Validated by Zod in `backend/src/config/env.ts`; the process refuses to boot on invalid values.
Placeholders live in `backend/.env.example`.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string, e.g. `postgresql://postgres:YOUR_PASSWORD@localhost:5432/careerforge` |
| `FRONTEND_URL` | yes | Exact frontend origin allowed by CORS (no wildcards) |
| `PORT` | no | API port, defaults to `5000` |
| `NODE_ENV` | no | `development` \| `test` \| `production`, defaults to `development` |
| `COOKIE_NAME` | no | Future session cookie name, defaults to `careerforge_session` |

### Available scripts (backend)

| Command | Description |
|---|---|
| `npm run dev` | Run the API with `tsx` watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Type-check without emitting |
| `npm start` | Run the compiled server from `dist/` |
| `npm run prisma:validate` | Validate `prisma/schema.prisma` |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Create/apply a development migration |
| `npm run prisma:studio` | Open Prisma Studio |

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Liveness probe — no database round-trip, so it stays green before migrations run |
| `ANY` | `/api/auth/*` | `501` — scaffolded for the authentication phase |
| `ANY` | `/api/jobs/*` | `501` — scaffolded |
| `ANY` | `/api/applications/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/dsa/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/projects/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/study/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/resumes/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/users/*` | `401` — behind `requireAuth` |
| `ANY` | anything else | `404` |

```bash
curl http://localhost:5000/api/health
```

```json
{
  "success": true,
  "message": "CareerForge API is running",
  "environment": "development",
  "uptimeSeconds": 12
}
```

Errors use the same envelope, with `code` always set and `stack`/`details` only outside production:

```json
{
  "success": false,
  "message": "Route GET /api/nope does not exist.",
  "code": "NOT_FOUND"
}
```

### Data model

`backend/prisma/schema.prisma` defines the initial relational model — `User`, `Company`, `Job`,
`Application`, `DSAProblem`, `DSAProgress`, `Project`, `StudyTask`, `Resume`, and `Notification`,
plus a `Session` table to back the future HTTP-only session cookie (only a hash of the opaque
cookie value is stored).

- `Job` belongs to a `Company` via `companyId`; applications reference a `Job`.
- Uniqueness: `User.email`, `Application(userId, jobId)`, `DSAProgress(userId, problemId)`.
- Deletion: user-owned rows (`Application`, `DSAProgress`, `Project`, `StudyTask`, `Resume`,
  `Notification`, `Session`) cascade when the user is deleted. `Company → Job` and
  `Job → Application` use `onDelete: Restrict`, so shared reference data and historical
  application records are never destroyed as a side effect.
- Resume files are **never** stored in PostgreSQL — only metadata plus a nullable `fileUrl`
  pointing at future object storage.

### Migration status

The `init` migration has been applied. `prisma/migrations/20260926112413_init/migration.sql` created
11 tables (`users`, `sessions`, `companies`, `jobs`, `applications`, `dsa_problems`, `dsa_progress`,
`projects`, `study_tasks`, `resumes`, `notifications`) and 11 enums in the `careerforge` database,
and `prisma migrate status` reports the schema is up to date.

To rebuild it from scratch on another machine:

```bash
cd backend
npm run prisma:migrate      # npx prisma migrate dev --name init
```

> **Note:** `prisma migrate dev` can appear to hang when its stdin is an interactive console. If it
> does, run it with stdin closed instead:
> `cmd /c "npx prisma migrate dev --name init < NUL"`

### Not implemented yet (by design)

Authentication (login/register, bcrypt hashing, session cookie issuing, logout), every resource
route, GitHub/LeetCode integrations, job scraping, AI, resume file storage, email, and the
notification service. `requireAuth` rejects with `401` and never attaches a fabricated `req.user`,
so no protected route can appear to work. The frontend mock auth store is still the only auth path
in the app.

## 🗂️ Project Structure

```
careerforge/
├── src/                # React frontend (unchanged by backend work, kept at the repo root)
│   ├── components/     # Reusable UI (Sidebar, Topbar, StatCard, StatusBadge, …)
│   ├── layouts/        # DashboardLayout & AuthLayout shells
│   ├── pages/          # Dashboard, Jobs, Applications, DSA, Projects, Study, Resume, Analytics, Settings, Login, Register
│   ├── data/           # mockData.ts — all centralized mock data
│   ├── store/          # useAppStore.ts — Zustand global state
│   ├── lib/            # utilities (cn, date helpers)
│   ├── config/         # navigation configuration
│   └── types.ts        # shared TypeScript interfaces
├── backend/
│   ├── prisma/
│   │   └── schema.prisma   # data model + enums + indexes
│   ├── prisma.config.ts    # Prisma 7 CLI config
│   ├── .env.example         # placeholders only; .env is git-ignored
│   ├── tsconfig.json
│   └── src/
│       ├── config/         # env.ts (Zod validation), prisma.ts (client singleton)
│       ├── controllers/    # request handlers
│       ├── middleware/     # authMiddleware.ts, errorHandler.ts, notFound.ts
│       ├── routes/         # routers mounted under /api
│       ├── services/       # business logic + database access (next phase)
│       ├── types/          # Express request augmentation
│       ├── utils/          # ApiError, httpResponse
│       ├── app.ts          # Express app factory
│       └── server.ts       # HTTP listener + graceful shutdown
└── ...
```

## 🗺️ Roadmap

- [x] Project setup, design system, routing, layout, dashboard, mock data
- [x] Settings & integrations UI
- [x] Mock authentication UI (login/register, protected routes, session persistence)
- [x] Backend foundation: Express app, env validation, Prisma schema, health endpoint
- [ ] Job board with search & filters
- [ ] Kanban application tracker
- [ ] DSA problem tracker
- [ ] Project portfolio & study planner
- [ ] Resume management & analytics dashboard
- [ ] Authentication API (sessions, password hashing, route guards)
- [ ] REST APIs for jobs, applications, DSA, projects, study tasks, resumes
- [ ] GitHub, LeetCode, and AI assistant integration

## 📄 License

This project is for educational/portfolio purposes. Make sure you don't use real company job listings as actual postings — the job data shown is mock UI data only.