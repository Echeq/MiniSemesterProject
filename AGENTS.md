# AGENTS.md — MiniSemesterProject (TaskFlow)

## Current state

**This project is mid-migration.** The live app runs React 19 + Supabase. Vue 3 files (`*.vue`, `main.ts`, `stores/`, `pages/`, `composables/`) and the NestJS backend scaffold (`backend/`) are dead code — do not extend them.

## AI Commands

- `@ai-log` — Log the last interaction to `docs/log/`
- `@ai-commit` — Stage all changes, create a conventional commit

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, TypeScript 6 |
| State/API | Supabase (auth, Realtime, Postgres via supabase-js) |
| DnD | @dnd-kit/core + @dnd-kit/sortable |
| Export | xlsx, jsPDF |
| Test | Vitest 4 with `@vitejs/plugin-react` + `@tailwindcss/vite` |
| Backend (stale) | NestJS 11 scaffold (empty AppModule, no Prisma service) |
| AI Assistant | OpenCode |

## Team

- **Frontend** (`frontend/src/`) — @MemerZxZ
- **Backend/API** — Supabase (managed by @goanarbolkong)
- **PM/QA** — @Echeq

## Commands

| Directory | Command | Action |
|---|---|---|
| `frontend/` | `npm run dev` | Start Vite dev server |
| `frontend/` | `npm run build` | Vite production build (no typecheck step) |
| `frontend/` | `npm run test` | Vitest (globals: true, 15s timeout) |
| `frontend/` | `npm run test:watch` | Vitest watch mode |
| `backend/` | `npm run start:dev` | NestJS watch mode (empty module) |
| `backend/` | `npx prisma migrate dev` | Run pending Prisma migrations |
| `backend/` | `npx prisma generate` | Regenerate Prisma client |
| `backend/` | `npm run test` | Jest (spec files) |

## Architecture

### Frontend (`frontend/`)
- Entry: `index.html` → `src/main.jsx` → `App.jsx`
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `frontend/.env`
- Auth via `useAuth` hook → `supabase.auth`
- Kanban data via `useBoard` hook → `supabase.from('tasks')` with `postgres_changes` Realtime subscription
- Drag & drop: `@dnd-kit/core` (DndContext, DragOverlay), `@dnd-kit/sortable` (useSortable, SortableContext)
- Routing: no react-router; single-page Board rendered conditionally on auth state
- Stale code (do not touch): `src/main.ts`, `src/App.vue`, `src/style.css`, `src/stores/`, `src/pages/`, `src/composables/`, `src/assets/`

### Supabase (`supabase/`)
- **Migrations** in `supabase/migrations/` are the DB source of truth (3 migrations applied)
- Tables: `public.profiles` (one row per auth user), `public.tasks` (Kanban cards)
- Task columns: `todo` / `doing` / `done` (enum `public.task_status`)
- Sort order: `position` uses fractional indexing (double precision, midpoint on reorder)
- RLS: authenticated users can read all, insert as self, update/delete any task
- `created_by` and timestamps are immutable via column-level `REVOKE UPDATE`
- Realtime: `alter publication supabase_realtime add table public.tasks`
- Seed: `supabase/seed.sql` (run after at least one auth user exists)

### Backend (`backend/`) — stale scaffold
- NestJS 11 with Prisma 6 (client output: `generated/prisma/`)
- `AppModule` is empty — no controllers, no Prisma service, no gateways
- Schema in `backend/prisma/schema.prisma` mirrors the original design but is **not** the active schema
- Prisma `generated/` dir is gitignored

## Conventions

- `.env` files are never committed
- `backend/generated/prisma/` is never committed
- Conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- No CI pipeline configured (no `.github/` dir)
- TypeScript check runs via `tsc --noEmit` — no dedicated npm script, use `npx tsc -p tsconfig.app.json`
- Lint: ESLint flat config (`eslint.config.js`) with `react-hooks` + `react-refresh` plugins for `*.{js,jsx}` files
