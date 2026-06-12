# AGENTS.md — MiniSemesterProject

## AI Commands

- `@ai-log` — Log the last interaction to `docs/log/`
- `@ai-commit` — Stage all changes and create a conventional commit

## Commands

| Directory | Command | Action |
|---|---|---|
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production build (no typecheck) |
| `frontend/` | `npm test` | Run vitest |
| `backend/` | `npm run start:dev` | NestJS dev server (--watch) |
| `backend/` | `npm run lint` | ESLint --fix (flat config in `eslint.config.mjs`) |
| `backend/` | `npm test` | Jest unit tests (`*.spec.ts`) |
| `backend/` | `npm run test:e2e` | Jest e2e tests (`*.e2e-spec.ts`) |
| `backend/` | `npx prisma generate` | Regenerate Prisma client (`backend/generated/prisma/`) |
| `backend/` | `npx prisma migrate dev` | Run pending Prisma migrations |
| `backend/` | `npx prisma studio` | Open Prisma DB browser |
| `supabase/` | `supabase start` | Start local Supabase |
| `supabase/` | `supabase db reset` | Run all migrations + seed |

## Architecture

- **Frontend** is **React 19 + Vite 8 + Tailwind 4 + @dnd-kit + Supabase**.  
  Entry: `frontend/src/main.jsx` → `App.jsx`.  
  **Vue 3 scaffolding** (`App.vue`, `main.ts`, `pages/`, `stores/`) exists but is **dead code** — do not edit.
- **Supabase** is the *actual* current backend (auth, DB, realtime).  
  Migrations in `supabase/migrations/`. Tasks use `task_status` enum: `todo | doing | done`.  
  Drag-and-drop ordering uses a custom `positionBetween()` scheme (see `tests/api.test.js` and `supabase/README.md`).
- **NestJS backend** (`backend/`) is scaffolded only (`GET /` → "Hello World!").  
  No Prisma migrations directory exists yet. Feature modules (Prisma service, Socket.IO gateway) not built.
- **No CI/CD** configured.
- OpenCode config is in `.opencode/` (no `opencode.json` at root).

## Supabase constraints

| Field | Limit |
|---|---|
| `tasks.description` | ≤ 5000 chars |
| `profiles.display_name` | ≤ 100 chars |
| Tasks table | RLS enforced, single shared board |

## Conventions

- `.env` files and `backend/generated/prisma/` are never committed.
- Conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- Frontend `src/` is **JSX** (not TypeScript). `tsconfig.json` is for config/build tooling only.
