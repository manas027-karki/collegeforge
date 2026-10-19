# CareerForge — Development Roadmap

A working handoff document. Read the **Quick start** and **Current state** sections,
then pick up the first task in **Phase 2** that is not already ticked.

Last updated: after commit `23b2daa` (Phase 1 complete: frontend wired to the auth API).

---

## Quick start

Two terminals, both required — the app is not useful with only one running.

```bash
# terminal 1 — API on :5000
cd backend
npm install
cp .env.example .env        # set your real PostgreSQL password
npm run prisma:migrate
npm run dev

# terminal 2 — web on :5173
npm install
npm run dev
```

Open **http://localhost:5173** and sign up.

### Verify the stack

```bash
# API is alive
curl http://localhost:5000/api/health

# the browser stays on one origin; Vite proxies /api to the backend
curl http://localhost:5173/api/health

# end-to-end auth journey in headless Chrome (13 checks, no npm dependencies)
npm run test:e2e
```

### Commands

| Where | Command | What it does |
|---|---|---|
| root | `npm run dev` | Vite dev server (`:5173`) with the `/api` proxy |
| root | `npm run build` | `tsc -b` then a production bundle |
| root | `npm run lint` | Oxlint |
| root | `npm run test:e2e` | Headless-Chrome auth journey |
| root | `npm run preview` | Serves the production bundle (also proxies `/api`) |
| `backend/` | `npm run dev` | API with `tsx watch` (`:5000`) |
| `backend/` | `npm run build` | Compiles to `dist/` |
| `backend/` | `npm run typecheck` | `tsc --noEmit` |
| `backend/` | `npm run prisma:migrate` | Applies migrations |
| `backend/` | `npm run prisma:studio` | Prisma Studio |

> **Prisma on Windows:** `prisma migrate dev` can appear to hang when stdin is an
> interactive console. Run it with stdin closed:
> `cmd /c "npx prisma migrate dev --name init < NUL"`

---

## Current state

### Done and verified

| Area | Detail |
|---|---|
| Frontend UI | 11 screens, ~90 components, full design system (Tailwind 4, indigo `primary` scale) |
| Routing | React Router 7 with `ProtectedRoute` / `PublicOnlyRoute` |
| State | Zustand 5 with `persist` |
| API client | `src/lib/api/` — axios, `withCredentials`, envelope unwrapping, `ApiRequestError` |
| Auth API | register / login / logout / me — bcrypt, SHA-256-hashed session tokens, httpOnly cookie |
| Route guards | Driven by `authStatus`, verified against `GET /api/auth/me` on every boot |
| Prisma schema | 11 models, 12 enums, 3 migrations applied |
| Tests | `e2e/auth.e2e.mjs` — 13 checks, stable across repeated runs |
| CI-less but green | typecheck, lint, build, and `prisma validate` all pass |

### The security model, in one place

- Passwords: bcrypt at `BCRYPT_ROUNDS` (default 12). Only the digest is stored.
- Session tokens: 32 random bytes, base64url. **Only a SHA-256 digest reaches PostgreSQL.**
- Cookie: `httpOnly`, `secure` in production, `sameSite` configurable.
- Login is not enumerable: unknown email and wrong password return the same 401, and an
  unknown email is compared against a decoy hash so response latency cannot be used to
  probe for registered addresses.
- `SAFE_USER_SELECT` is an allow-list projection, so `passwordHash` is never even read
  into memory on the request path.
- Expired sessions are deleted on sight and can never authenticate.

### What is still mock

Everything except auth. These files read `mockData` directly and must be converted as
each resource API lands:

| File | Line | Reads |
|---|---|---|
| `src/pages/Jobs.tsx` | 11 | `mockData.jobs` |
| `src/pages/DSA.tsx` | 90 | `mockData.dsaSolvedOverTime` |
| `src/components/DsaProgressCard.tsx` | 38 | `mockData.dsaStats` |
| `src/components/DeadlineList.tsx` | 33 | `mockData.deadlines` |
| `src/components/NotificationsMenu.tsx` | 77 | `mockData.activities` |
| `src/components/RecentActivity.tsx` | 20, 28 | `mockData.activities` |
| `src/components/Sidebar.tsx` | 135 | `mockData.user.role` |

---

## Conventions to follow

These are already established in the codebase. Match them and the remaining work is
mechanical.

### Backend resource pattern

Four files per resource, mirroring `auth.service.ts` / `auth.controller.ts`:

```
backend/src/validation/<resource>.schemas.ts   Zod request schemas
backend/src/services/<resource>.service.ts     business logic + Prisma
backend/src/controllers/<resource>.controller.ts thin HTTP layer
backend/src/routes/<resource>.routes.ts         router
```

Rules that the auth code already follows:

- **Services never touch `req`/`res`.** They take plain inputs and return plain values.
- **Controllers are thin.** They parse, call the service, set status codes, and send the
  envelope. They never contain query logic.
- **Response envelope.** `sendSuccess(res, message, { data }, status)` →
  `{ success: true, message, data }`. Errors use `sendError` and always carry a `code`.
- **Validation lives on the server.** Client-side validation is a UX affordance only.
  `ZodError` is handled centrally in `middleware/errorHandler.ts` and becomes a 400.
- **Every user-scoped query filters by `req.user.id`.** `requireAuth` guarantees
  `req.user` exists; it is `undefined` for anonymous requests, never fabricated.

### Frontend API pattern

```
src/lib/api/client.ts     axios instance, envelope unwrapping, ApiRequestError
src/lib/api/auth.ts       auth endpoints + the AuthUser -> UserProfile mapper
src/lib/api/resources.ts  (to be created) one module per resource
```

- Resource calls go through `apiRequest<TFields>({ method, url, data })`.
- Failures arrive as `ApiRequestError` with `.status`, `.code`, `.details`.
  `error.isUnauthorized` and `error.isNetworkError` are the two worth branching on.
- **The API is same-origin by default.** `VITE_API_URL` stays unset in development
  because the Vite dev server proxies `/api`. Set it only when the API is on a different
  domain, and add that origin to the backend's `FRONTEND_URL` at the same time.

### Store pattern

- Actions in `src/store/useAppStore.ts` are the only way components mutate state.
- Async actions `throw` on failure and let the caller decide how to surface it.
- Use a request ticket (as `authRequestTicket` does) when two async paths can race.

---

## Phase 2 — Resource APIs

Seven routers still answer `501`. This is the bulk of the remaining engineering.

Recommended order: `users/me` → `projects` → `study` → `dsa` → `resumes` →
`applications` → `jobs`. The first two are small and prove the pattern; `jobs` is last
because it is the most complex and `applications` depends on it.

Each item below is a checkbox. Tick them as you go.

### 2.1 `users/me` — profile

- [ ] `validation/user.schemas.ts` — `updateProfileSchema` (name, phone, college, degree,
      `graduationYear` as an int, bio)
- [ ] `services/user.service.ts` — `findSafeUserById` already exists in `auth.service.ts`
      and can be reused; add `updateProfile`
- [ ] `controllers/user.controller.ts` — `GET /me`, `PATCH /me`
- [ ] `routes/users.routes.ts` — replace `notImplemented('Users')`
- [ ] Frontend: `src/lib/api/users.ts`, store actions `fetchProfile` / `updateProfile`
- [ ] Frontend: `ProfileSettings.tsx` should call the API instead of only the store

`graduationYear` is an `Int?` in the database and a `string` in the frontend
(`src/types.ts`). Convert at the API boundary, the same way `auth.ts` does.

### 2.2 `projects`

- [ ] `validation/project.schemas.ts`
- [ ] `services/project.service.ts` — list / create / update / delete, all scoped to
      `req.user.id`
- [ ] `controllers/project.controller.ts`
- [ ] `routes/projects.routes.ts`
- [ ] Frontend: replace the store's local CRUD with API calls
- [ ] Frontend: `src/pages/Projects.tsx` + `src/components/projects/*` stop using the store
      arrays directly and render from fetched state

The Prisma model uses `technologies String[]` and a `ProjectStatus` enum
(`PLANNED | IN_PROGRESS | COMPLETED | ARCHIVED`). The frontend type uses
`technologies: string[]` and the same status values, so this one maps cleanly.

### 2.3 `study` (study tasks)

- [ ] `validation/studyTask.schemas.ts`
- [ ] `services/studyTask.service.ts` — plus a `toggle` action for
      `TODO <-> COMPLETED`
- [ ] `controllers/studyTask.controller.ts`
- [ ] `routes/study.routes.ts`
- [ ] Frontend: `src/pages/StudyPlanner.tsx` + `src/components/study/*`

The model requires `dueDate` (no default) and `category`. The frontend's `StudyTask`
type has `createdAt` as a string and no `updatedAt` — check what you actually need
before adding columns.

### 2.4 `dsa`

Two resources, not one:

- [ ] `validation/dsa.schemas.ts`
- [ ] `services/dsa.service.ts` — the `DSAProblem` catalogue is **shared** across users,
      while `DSAProgress` is per-user
- [ ] `controllers/dsa.controller.ts` — problems CRUD + progress read/update
- [ ] `routes/dsa.routes.ts`
- [ ] Frontend: `src/pages/DSA.tsx`, `src/components/dsa/*`

`DSAProblem` has no `userId` — it is shared reference data, like `Company`. But a
problem created by one user is visible to all, so decide whether that is intended and
write it down. `DSAProgress` is unique on `(userId, problemId)`.

### 2.5 `resumes`

- [ ] `validation/resume.schemas.ts`
- [ ] `services/resume.service.ts` — metadata only; `fileUrl` stays `null`
- [ ] `controllers/resume.controller.ts`
- [ ] `routes/resumes.routes.ts`
- [ ] Frontend: `src/pages/Resume.tsx` + `src/components/resume/*`

The frontend currently stores the file as a `blob:` URL in the store and revokes it on
delete. In the API-backed version the file is metadata only — there is no object storage
yet, so the upload button should either be disabled or clearly marked as
"metadata only, storage coming". The model comment already says this.

`Resume.version` is a required `Int` with no default. The frontend auto-increments it
in the store, so the service has to do that server-side instead.

### 2.6 `applications`

- [ ] `validation/application.schemas.ts`
- [ ] `services/application.service.ts` — the status transition
      `SAVED -> APPLIED -> OA -> INTERVIEW -> SELECTED / REJECTED`; set `appliedAt` when
      the status first leaves `SAVED`
- [ ] `controllers/application.controller.ts`
- [ ] `routes/applications.routes.ts`
- [ ] Frontend: `src/pages/Applications.tsx` + `src/components/applications/*`

`Application` references `jobId`, and `Job` references `companyId`. The frontend's
`Application` type **denormalizes** `company`, `role`, and `location` as plain strings.
Either expand the relation in the API response and map it in the frontend, or change the
frontend type. The API response should stay relational and let the client flatten it.

Unique on `(userId, jobId)` — creating a duplicate must return a 409.

### 2.7 `jobs` (public, the hardest one)

- [ ] `validation/job.schemas.ts` — search, filters, sort, pagination
- [ ] `services/job.service.ts` — list with filters, get one, plus any admin write path
- [ ] `controllers/job.controller.ts`
- [ ] `routes/jobs.routes.ts` — note this router is **public**: no `requireAuth`
- [ ] Frontend: `src/pages/Jobs.tsx` + `src/components/jobs/*`
- [ ] Pagination — no endpoint paginates yet, and jobs/DSA lists will need it

`Job` belongs to `Company` via `companyId`, and `Job → Application` is
`onDelete: Restrict`, so a job with applications cannot be deleted.

---

## Phase 3 — Known bugs

Each of these is a bug a reviewer will hit within 30 seconds of opening the app. Fix
them as you go, or in one pass at the end.

- [ ] **User-created data is lost on refresh.**
      `src/store/useAppStore.ts:531` — `partialize` persists only `isAuthenticated`,
      `currentUser`, and `profile`. Every entity collection (applications, projects,
      tasks, resumes, DSA problems) is re-hydrated from `mockData` on reload. Either
      extend `partialize` or, better, drop the mock data entirely once the APIs land.

- [ ] **Dashboard numbers never move.**
      `src/pages/Dashboard.tsx:15` reads `dashboardStats`, a static snapshot from
      `mockData`. Adding an application does not change the counter. The Applications
      page derives its own stats correctly with `useMemo` — copy that approach.

- [ ] **Dark mode and density do nothing.**
      `src/components/settings/AppearanceSettings.tsx` sets `data-theme` and
      `data-density` on `<html>`, but `src/index.css` only has rules for
      `data-reduce-animations`. There are no `[data-theme='dark']` or
      `[data-density='compact']` selectors, so both controls are cosmetic. Tailwind 4
      wants a `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`.

- [ ] **Appearance preferences do not persist.** `theme`, `density`, `reduceAnimations`,
      and `notificationSettings` are not in `partialize`, and the effect that applies
      them only runs while the Settings page is mounted.

- [ ] **The apply effect is Settings-only.** The `useEffect` that writes the
      `data-*` attributes lives in `AppearanceSettings.tsx`, so the theme is not applied
      on any other route. Move it to a layout or an app-level component.

- [ ] **Notifications and activity are hardcoded.**
      `NotificationsMenu.tsx:77` and `RecentActivity.tsx:20` read `mockData.activities`.
      The `Notification` model and `NotificationType` enum already exist in the schema
      but have no endpoint.

- [ ] **The sidebar role is hardcoded.**
      `src/components/Sidebar.tsx:135` shows `mockData.user.role`, which no user can
      change. It should come from the profile.

---

## Phase 4 — Infrastructure

What turns "a project" into "a resume project".

- [ ] **`prisma/seed.ts`** — populate companies, jobs, and DSA problems. The existing
      `src/data/mockData.ts` is a ready-made seed source. Register it in
      `backend/package.json` and add a `prisma:seed` script.
- [ ] **`docker-compose.yml`** — Postgres + API + web, one command to run the stack.
- [ ] **Vitest + Supertest** — there are currently **no unit or integration tests**,
      only the browser e2e. Start with the auth service: register, login, me, logout,
      and 401 after expiry. Then one test per resource service.
- [ ] **GitHub Actions** — typecheck, lint, build, and test on push. A passing badge on
      the README is worth a lot.
- [ ] **Deploy it** — Railway or Render for the API + Postgres, Vercel for the
      frontend. Set `VITE_API_URL` to the deployed API and add the frontend's origin to
      the backend's `FRONTEND_URL`. **A live URL is the single highest-value resume item.**

---

## Phase 5 — Polish

- [ ] Rewrite the README opening: live demo link, screenshots, an architecture diagram.
- [ ] Add a "What I built" section that maps 1:1 to resume bullet points.
- [ ] Optional differentiator: an **AI resume / job-description analyzer** built on the
      Claude API. It needs one more service plus a settings page for the API key. Do
      this only after Phases 2–4.

---

## Open decisions

These were open when this document was written.

1. **The `Contract` job type.** `src/types.ts:64` has
   `JobType = 'Full-time' | 'Internship' | 'Contract'`, but the Prisma `JobType` enum
   has only `INTERNSHIP` and `FULL_TIME`. Either add `CONTRACT` to the enum (one line
   plus a migration) or drop it from the UI filter. The `Job.experience` mismatch was
   already resolved — `ExperienceLevel` and `jobs.experience` landed in migration
   `20261019120000`.

2. **Where job listings come from.** A fixed seed dataset, a scraper, or a third-party
   API. This changes the `Company` / `Job` ownership model, so settle it before
   writing the jobs service. Note that scraping real job listings has terms-of-service
   and legal implications — a seed dataset or an official API is the safer choice for
   a portfolio project.

3. **Whether `DSAProblem` is genuinely shared.** The model has no `userId`, so a
   problem created by one user is visible to all. Intended, or should the catalogue be
   curated and read-only?

4. **Session cleanup.** Expired sessions are deleted when they are used, but nothing
   sweeps rows that are never used again. The `sessions(user_id, expires_at)` index
   exists for exactly that sweep.

---

## Gotchas

Things that will cost time if you do not know them in advance.

- **CORS is not the problem in development.** The Vite dev server proxies `/api`, so the
  browser only ever talks to one origin. If you ever see "Cannot reach the CareerForge
  API", check the proxy is running before you touch CORS.
- **`FRONTEND_URL` is a comma-separated allow-list** and the backend reflects the
  request's own origin when it is allowed. It used to return a fixed origin, which
  silently broke `http://127.0.0.1:5173` against a `localhost`-configured backend.
- **Loopback origins are trusted in development** on any port, because Vite picks the
  next free port when 5173 is taken. Production keeps the strict list.
- **Do not set `VITE_API_URL` in development.** It bypasses the proxy and puts you back
  on cross-origin requests.
- **Restart the backend after editing `backend/.env`.** `dotenv` does not override
  variables that are already set in `process.env`, so a watch-mode reload keeps the
  old value.
- **`tsx watch` re-transpiles the generated Prisma client on the first start** and can
  take a while on a cold cache. Subsequent rebuilds are under a second. This is not a
  hang.
- **`prisma generate` is required after every schema change** or the typed client will
  be out of date and the typecheck will fail in confusing ways.
- **The generated Prisma client is git-ignored** (`backend/src/generated`). It is
  regenerated by the `postinstall` script.

---

## Framing for a resume

The project already demonstrates more than the UI suggests. Once the resource APIs
land, the honest bullet points are roughly:

- Built a full-stack career-management platform (React 19, TypeScript, Express 5,
  Prisma 7, PostgreSQL) with a session-cookie authentication system using bcrypt
  password hashing and SHA-256-hashed session tokens, designed so no raw credential or
  token is ever stored.
- Modeled 11 relational entities with referential-integrity rules, and enforced
  tenant isolation on every user-scoped query.
- Wrote a dependency-free end-to-end test harness that drives headless Chrome over
  the DevTools Protocol to verify the full authentication journey.
- Shipped a responsive 11-screen interface with a component library, Kanban pipeline,
  and Recharts analytics over 90 components.

Those are only true once Phases 2 and 4 are done. Do not put them on a resume before
then.
