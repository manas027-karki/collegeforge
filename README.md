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

> **Note:** The dashboard, jobs board, applications, DSA tracker, projects, study planner,
> resumes, and analytics still read from realistic **mock data** (`src/data/mockData.ts`).
> Authentication is the first slice to run against the real API: the login and register
> forms call `POST /api/auth/*`, the session is a database-backed httpOnly cookie, and the
> route guards verify it with `GET /api/auth/me` on every boot.

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
- **Axios** — API client with credentialed cookie requests and a normalized error type
- **Recharts 3** — responsive, clean data visualizations
- **Lucide React** — consistent iconography

## 🚀 Getting Started

CareerForge is a two-part repository: the **frontend** (this Vite app, at the repo root) and the
**backend** (Express API, in `backend/`). They are installed and run
separately. The frontend directory was intentionally left at the repository root, so there is no
`cd frontend` step here — the commands below reflect the actual layout.

### Run the whole stack

Authentication needs both halves running at once:

```bash
# terminal 1 — API on :5000
cd backend
npm install
cp .env.example .env        # then set your real PostgreSQL password
npm run prisma:migrate
npm run dev

# terminal 2 — web on :5173
npm install
npm run dev
```

Open **http://localhost:5173** and sign up. The session is a database-backed httpOnly
cookie. In development the browser only ever talks to the frontend origin — the Vite
dev server proxies `/api` to the backend — so CORS is not part of the local setup.

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

The frontend calls the API at `/api/...` on its own origin, and the Vite dev
server proxies those calls to the backend. That keeps the browser on a single
origin, so there is no CORS negotiation in development and the session cookie
behaves like a same-site request. It also makes `http://localhost:5173` and
`http://127.0.0.1:5173` interchangeable.

To point the app at a deployed API, set `VITE_API_URL` (see `.env.example`).
To change where the dev server proxies to, set `VITE_PROXY_TARGET`.

### Available scripts (frontend)

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) then bundle for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint code-quality checks |
| `npm run test:e2e` | Drive the auth journey in headless Chrome against a running stack |

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
- **helmet**, **cors** (locked to an allow-list with credentials), **cookie-parser**,
  `express.json` body limits, and a single `{ success, message, ... }` response envelope

### Environment variables

Validated by Zod in `backend/src/config/env.ts`; the process refuses to boot on invalid values.
Placeholders live in `backend/.env.example`.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string, e.g. `postgresql://postgres:YOUR_PASSWORD@localhost:5432/careerforge` |
| `FRONTEND_URL` | yes | Comma-separated allow-list of browser origins, e.g. `http://localhost:5173,http://127.0.0.1:5173` |
| `PORT` | no | API port, defaults to `5000` |
| `NODE_ENV` | no | `development` \| `test` \| `production`, defaults to `development` |
| `COOKIE_NAME` | no | Session cookie name, defaults to `careerforge_session` |
| `COOKIE_SAME_SITE` | no | `lax` \| `strict` \| `none`, defaults to `lax` |
| `SESSION_DURATION_DAYS` | no | Default session lifetime, defaults to `7` |
| `SESSION_DURATION_DAYS_REMEMBERED` | no | Lifetime when "remember me" is checked, defaults to `30` |
| `BCRYPT_ROUNDS` | no | Password hashing cost factor, defaults to `12` |

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
| `POST` | `/api/auth/register` | Create an account and sign in — `201` |
| `POST` | `/api/auth/login` | Verify credentials and sign in — `200` |
| `POST` | `/api/auth/logout` | Invalidate the session — `200` (always) |
| `GET` | `/api/auth/me` | Current user for the session cookie — `200`, `401` when signed out |
| `GET` | `/api/users/me` | The signed-in user's profile — `200` |
| `PATCH` | `/api/users/me` | Partial profile update — `200` |
| `GET` | `/api/projects` | The signed-in user's projects — `200` |
| `POST` | `/api/projects` | Create a project — `201` |
| `GET` | `/api/projects/:id` | Read one project — `200` |
| `PATCH` | `/api/projects/:id` | Partial project update — `200` |
| `DELETE` | `/api/projects/:id` | Delete a project — `204` |
| `ANY` | `/api/jobs/*` | `501` — scaffolded |
| `ANY` | `/api/applications/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/dsa/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/projects/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/study/*` | `401` — behind `requireAuth` |
| `ANY` | `/api/resumes/*` | `401` — behind `requireAuth` |
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

### Authentication

Session-based, cookie-based, and built so the raw token never touches the database.

- **Passwords** are hashed with bcrypt at a configurable cost factor. Only the digest is
  written, and it is never selected into a response — `SAFE_USER_SELECT` is an allow-list
  projection, so `passwordHash` is not even read into memory on the request path.
- **Session tokens** are 32 random bytes (256 bits) encoded base64url. PostgreSQL stores
  only a SHA-256 digest, so a database leak cannot be replayed as a live session.
- **The cookie is `httpOnly`**, so page JavaScript cannot read the token. It is `secure` in
  production and `sameSite` is configurable.
- **Login is not enumerable.** Unknown emails and wrong passwords return the same 401 with
  the same wording, and an unknown email is compared against a decoy hash so response
  latency cannot be used to discover which addresses are registered.
- **Expired sessions are dead sessions.** The row is deleted on sight and can never
  authenticate, even if it is still present.
- **Logout always succeeds**, so signing out is a client-side state reset rather than an
  error path.

The frontend treats the cookie as the only source of truth. `GET /api/auth/me` is called
once on boot; the route guards render a loader until it resolves, so a signed-in visitor is
never bounced to the login screen on refresh.

### Data model

`backend/prisma/schema.prisma` defines the relational model — `User`, `Company`, `Job`,
`Application`, `DSAProblem`, `DSAProgress`, `Project`, `StudyTask`, `Resume`, and `Notification`,
plus a `Session` table backing the HTTP-only session cookie (only a hash of the opaque
cookie value is stored).

- `Job` belongs to a `Company` via `companyId`; applications reference a `Job`.
- `Job.experience` records the seniority band (`FRESHER`, `ONE_TO_TWO_YEARS`,
  `THREE_TO_FIVE_YEARS`) that the job board filters on.
- Uniqueness: `User.email`, `Application(userId, jobId)`, `DSAProgress(userId, problemId)`.
- Deletion: user-owned rows (`Application`, `DSAProgress`, `Project`, `StudyTask`, `Resume`,
  `Notification`, `Session`) cascade when the user is deleted. `Company → Job` and
  `Job → Application` use `onDelete: Restrict`, so shared reference data and historical
  application records are never destroyed as a side effect.
- Resume files are **never** stored in PostgreSQL — only metadata plus a nullable `fileUrl`
  pointing at future object storage.

### Migration status

Three migrations have been applied:

1. `20260926112413_init` — 11 tables (`users`, `sessions`, `companies`, `jobs`,
   `applications`, `dsa_problems`, `dsa_progress`, `projects`, `study_tasks`, `resumes`,
   `notifications`) and 11 enums.
2. `20260927042409_add_auth_sessions` — the `sessions(user_id, expires_at)` composite index
   used by live-session lookups and expiry sweeps.
3. `20261019120000_add_job_experience` — the `ExperienceLevel` enum and the
   `jobs.experience` column.

To rebuild it from scratch on another machine:

```bash
cd backend
npm run prisma:migrate      # npx prisma migrate dev --name init
```

> **Note:** `prisma migrate dev` can appear to hang when its stdin is an interactive console. If it
> does, run it with stdin closed instead:
> `cmd /c "npx prisma migrate dev --name init < NUL"`

### Not implemented yet (by design)

The job board, applications, DSA tracker, study planner, and resume routes still return
`501` — those screens continue to read from mock data. Also outstanding:
GitHub/LeetCode integrations, job scraping, AI, resume file storage, email, the
notification service, rate limiting, and password reset. `requireAuth` rejects with
`401` and never attaches a fabricated `req.user`, so no protected route can appear to
work.

## 🧪 Testing

`e2e/auth.e2e.mjs` drives the real auth journey in headless Chrome over the DevTools
Protocol — no test framework and no npm dependencies, just Node 22+ and a Chrome or Edge
binary. It covers the whole loop: registering an account, the app booting and settling on
the login screen, signing in, landing on the dashboard, the session surviving a reload,
signing out, and a protected route redirecting when signed out. It also fails the run on
any console error or failed network request.

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
npm run dev

# terminal 3
npm run test:e2e
```

Set `APP_URL` and `API_URL` to point at a different host, and `CHROME_PATH` if your
browser is not in a standard location.

## 🗂️ Project Structure

```
careerforge/
├── e2e/                # headless-Chrome end-to-end tests (no dependencies)
├── src/                # React frontend (kept at the repo root)
│   ├── components/     # Reusable UI (Sidebar, Topbar, StatCard, StatusBadge, …)
│   ├── layouts/        # DashboardLayout & AuthLayout shells
│   ├── pages/          # Dashboard, Jobs, Applications, DSA, Projects, Study, Resume, Analytics, Settings, Login, Register
│   ├── data/           # mockData.ts — all centralized mock data
│   ├── store/          # useAppStore.ts — Zustand global state
│   ├── lib/
│   │   ├── api/        # axios client, normalized errors, auth endpoints
│   │   ├── analytics.ts, cn.ts, dates.ts
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
│       ├── services/       # business logic + database access
│       ├── types/          # Express request augmentation
│       ├── validation/     # Zod request schemas
│       ├── utils/          # ApiError, httpResponse, session
│       ├── app.ts          # Express app factory
│       └── server.ts       # HTTP listener + graceful shutdown
└── ...
```

## 🗺️ Roadmap

> **[ROADMAP.md](./ROADMAP.md)** is the working document: the current state, the
> conventions to follow, every remaining task broken down file by file, the known
> bugs, and the open decisions. Start there.
>
> **[AGENTS.md](./AGENTS.md)** holds the working agreements — how to structure a
> change, how to commit it, and the rules that have already been broken once.

- [x] Project setup, design system, routing, layout, dashboard, mock data
- [x] Settings & integrations UI
- [x] Frontend UI for every screen (login/register, dashboard, jobs, applications, DSA,
      projects, study planner, resume, analytics, settings)
- [x] Backend foundation: Express app, env validation, Prisma schema, health endpoint
- [x] Authentication API: register, login, logout, session cookie, route guards
- [x] Frontend wired to the auth API with cookie-based session verification
- [x] End-to-end auth test in headless Chrome
- [ ] REST APIs for jobs, applications, DSA, projects, study tasks, resumes, users
- [ ] Frontend switched from mock data to those APIs
- [ ] Job board with search & filters
- [ ] Kanban application tracker
- [ ] DSA problem tracker
- [ ] Project portfolio & study planner
- [ ] Resume management & analytics dashboard
- [ ] Docker Compose, seed script, and CI
- [ ] GitHub, LeetCode, and AI assistant integration

## 📄 License

This project is for educational/portfolio purposes. Make sure you don't use real company job listings as actual postings — the job data shown is mock UI data only.