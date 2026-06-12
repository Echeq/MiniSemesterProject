# AGENTS.md — TaskFlow

## AI Commands

- `@ai-log` — Log the last interaction to `docs/log/`
- `@ai-commit` — Stage all changes and create a conventional commit

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, @dnd-kit/core |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Auth | Supabase Auth |

## Team

- **Frontend** (`frontend/src/`) — @MemerZxZ
- **Backend** (Supabase) — @goanarbolkong
- **PM/QA** — @Echeq

## Project state

Auth scaffolded (login/signup pages, AuthContext, ProtectedRoute, supabase client). Kanban features (`components/kanban/`, `components/forms/`), backend Edge Functions (`backend/src/` stubs), and Supabase schema (`supabase/`) not yet implemented.

## Commands (run from `frontend/`)

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | `tsc -b && vite build` (typecheck first) |
| `npm run preview` | Preview production build |

No lint, test, or format scripts configured yet.

## Setup

- **`.env` file** goes in `frontend/` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (both required). `VITE_API_BASE_URL` is optional (defaults to `http://localhost:3000/api`). See `frontend/.env.example`.
- **Backend** is pure Supabase — no server code. `backend/src/` subdirectories exist only for Edge Function stubs. Schema goes in `supabase/`.
- See [Supabase setup](docs/setup/supabase.md) and [npm setup](docs/setup/npm.md).

## Conventions

- `.env` files are never committed.
- TypeScript **strict mode** with `noUnusedLocals` and `noUnusedParameters` — no dead code.
- No path aliases configured (no `@/` imports).
- Single frontend package under `frontend/`, not a monorepo. No root `package.json`.
- Conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
