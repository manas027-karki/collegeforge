# AGENTS.md

Working agreements for this repository. Read this before making changes.

## Project

**CareerForge** — a career-management platform for students. DSA practice, a job
board, an application Kanban, a project portfolio, a study planner, resume
versions, and analytics.

Two parts:

- **Frontend** at the repo root — React 19, TypeScript, Vite 8, Tailwind 4,
  React Router 7, Zustand 5, Recharts 3, Axios.
- **Backend** in `backend/` — Express 5, TypeScript 7, Prisma 7, PostgreSQL, Zod 4.

**[ROADMAP.md](./ROADMAP.md)** is the working document: what is done, what is
left, the open decisions, and the gotchas. Start there.

## Working agreements

### Commit granularly

**One logical change per commit.** Prefer many small commits over one large
one. Commit related files together when they form a single change — a new
endpoint is one commit (schema + service + controller + route), not four.

- Every commit must leave the repository **building and type-checking**. Stage
  in dependency order when a later file depends on an earlier one.
- Use conventional prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
  `chore:`.
- Write the body for the *why*, not the *what*. The diff already shows the what.

### Verify before committing

```bash
# root
npm run lint
npm run build
npm run test:e2e

# backend/
npm run typecheck
npm run build
```

The e2e suite drives real headless Chrome against a running stack. It needs the
API on `:5000` and the web on `:5173`.

### Do not rewrite pushed history

`main` is pushed. Use additive commits. If a mistake ships, fix it in a new
commit rather than rebasing.

## Architecture

### Backend resource pattern

Four files per resource, mirroring `auth.service.ts` / `auth.controller.ts`:

```
backend/src/validation/<resource>.schemas.ts   Zod request schemas
backend/src/services/<resource>.service.ts     business logic + Prisma
backend/src/controllers/<resource>.controller.ts thin HTTP layer
backend/src/routes/<resource>.routes.ts         router
```

- **Services never touch `req`/`res`.** Plain inputs in, plain values out.
- **Controllers are thin.** Parse, call the service, set the status, send the
  envelope. No query logic.
- **The envelope.** `sendSuccess(res, message, { data }, status)` →
  `{ success: true, message, data }`. Errors use `sendError` and always carry
  a `code`.
- **Validation lives on the server.** Client-side validation is a UX
  affordance. `ZodError` becomes a 400 centrally in `middleware/errorHandler.ts`.
- **Every user-scoped query filters on `req.user.id`.** `requireAuth`
  guarantees `req.user` exists; it is `undefined` for anonymous requests,
  never fabricated. Use `currentUser(req)` from the auth middleware.

### Frontend API pattern

```
src/lib/api/client.ts     axios instance, envelope unwrapping, ApiRequestError
src/lib/api/user.ts       the shared user shape and its mapper
src/lib/api/<resource>.ts one module per resource
```

- Resource calls go through `apiRequest<TFields>({ method, url, data })`.
- Failures arrive as `ApiRequestError` with `.status`, `.code`, `.details`.
  `error.isUnauthorized` and `error.isNetworkError` are the two worth
  branching on.
- **The API is same-origin by default.** `VITE_API_URL` stays unset in
  development because the Vite dev server proxies `/api`. Set it only when the
  API is on a different domain, and add that origin to the backend's
  `FRONTEND_URL` at the same time.

### Store pattern

- `src/store/useAppStore.ts` is the only way components mutate state.
- Async actions `throw` on failure; the caller decides how to surface it.
- Use a request ticket (as `authRequestTicket` does) when two async paths can
  race.

## Rules that matter

These are the mistakes that have actually been made in this repo. Do not repeat
them.

1. **A schema with a default breaks partial updates.** Zod fills a defaulted
   field in when it is *absent*, so a patch that changed one field would
   silently wipe the others. Defaults belong on the create schema only.

2. **"Absent" and "explicit null" are different.** Absent leaves a field
   alone; `null` clears it. Assemble Prisma updates field by field — a blanket
   spread of the input collapses the distinction.

3. **Tenant isolation belongs in the service, not the controller.** Reads
   filter on `userId`. Writes use `updateMany`/`deleteMany` with
   `{ id, userId }` rather than `update`/`delete`, because those take a plain
   filter and make the owner check impossible to forget. Another account's
   resource answers `404`, exactly like one that never existed.

4. **`passwordHash` is never selected.** `SAFE_USER_SELECT` in
   `services/user.service.ts` is the allow-list. Read through it, never around
   it.

5. **Store calendar dates at UTC midnight.** A `YYYY-MM-DD` string from the UI
   becomes `new Date('${value}T00:00:00.000Z')`, so the date the user picked is
   the date that comes back in any timezone. `src/lib/dates.ts` parses both
   date-only strings and full API timestamps.

6. **The server owns the truth.** After a write, put the server's response
   into the store rather than assuming the input was stored as sent.

## Environment

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

`backend/.env` holds the real database password and is git-ignored. Only
`backend/.env.example` is tracked.

On Windows, `prisma migrate dev` can appear to hang when stdin is an
interactive console. Run it with stdin closed:

```
cmd /c "npx prisma migrate dev --name init < NUL"
```

`tsx watch` re-transpiles the generated Prisma client on a cold start and can
take a while. Subsequent rebuilds are under a second. That is not a hang.

## Current state

Live against the API: authentication (register, login, logout, me), the user
profile, and the project portfolio.

Still on mock data: jobs, applications, DSA, study tasks, resumes, and the
notifications feed. The routers for those still answer `501`.
