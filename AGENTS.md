# AGENTS.md — MiniSemesterProject

## AI Commands

- `@ai-log` — Log the last interaction to `docs/log/`
- `@ai-commit` — Stage all changes and create a conventional commit

## Commands

| Directory | Command | Action |
|---|---|---|
| `frontend/` | `npm run dev` | Vite dev server (needs `frontend/.env`) |
| `frontend/` | `npm run build` | Production build (no typecheck) |
| `frontend/` | `npm run preview` | Preview production build locally |
| `frontend/` | `npm test` | Run vitest (requires `frontend/.env`) |
| `frontend/` | `npm run test:watch` | Vitest watch mode |
| `backend/` | `npm run start:dev` | NestJS dev server (--watch) |
| `backend/` | `npm run build` | Compile NestJS to `dist/` |
| `backend/` | `npm run format` | Prettier (singleQuote, trailingComma: all) |
| `backend/` | `npm run lint` | ESLint --fix (flat config in `eslint.config.mjs`) |
| `backend/` | `npm test` | Jest unit tests (`*.spec.ts` in `src/`) |
| `backend/` | `npm run test:e2e` | Jest e2e tests (`*.e2e-spec.ts`) |
| `backend/` | `npx prisma generate` | Regenerate Prisma client to `backend/generated/prisma/` |
| `backend/` | `npx prisma migrate dev` | Run pending Prisma migrations |
| `backend/` | `npx prisma studio` | Open Prisma DB browser |
| `supabase/` | `supabase start` | Start local Supabase |
| `supabase/` | `supabase db reset` | Run all migrations + seed |

## Architecture

- **Frontend** is **React 19 + Vite 8 + Tailwind 4 + @dnd-kit + Supabase**.  
  Entry: `frontend/src/main.jsx` → `App.jsx`.  
  **Vue 3 scaffolding** (`App.vue`, `main.ts`, `pages/`, `stores/`) exists but is **dead code** — do not edit.  
  Two vite configs: `vite.config.js` (React) is active; `vite.config.ts` (Vue) is dead.
- **Supabase** is the *actual* current backend (auth, DB, realtime, storage).  
  Migrations in `supabase/migrations/` (5 files). Tasks use `task_status` enum: `todo | doing | done`.  
  Drag-and-drop ordering uses a custom `positionBetween()` scheme (see `frontend/tests/api.test.js:234` and `supabase/README.md`).
  Supabase client returns `null` when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` missing — app renders a setup hint instead of crashing.
  Avatar storage bucket (`avatars/`) — public read, authenticated upload at `avatars/{userId}/`, max 2 MB, PNG/JPEG/GIF/WebP only.
  **Role system** (migration `20260616100000`): `profiles.role` = `admin | member | unknown`. Admins: full CRUD + assign tasks. Members: read-only, see only assigned tasks. Unknown: empty board + invitation popup. First signup becomes admin. Invited users (via `invitations` table) become members on signup.
- **NestJS backend** (`backend/`) is scaffolded only (`GET /` → "Hello World!").  
  No Prisma migrations directory exists yet. Feature modules (Prisma service, Socket.IO gateway) not built.  
  Prisma 6 uses `backend/prisma.config.ts` for config (not auto-detected).
- **Two DB schemas** coexist: the **active Supabase schema** (`supabase/migrations/`) and the **future Prisma schema** (`backend/prisma/schema.prisma`). They are separate systems — do not reconcile.
- **No CI/CD** configured.
- OpenCode config is in `.opencode/` (no `opencode.json` at root).
- AI workflow reference: `docs/guide/ai.md`.

## Supabase constraints

| Field | Limit |
|---|---|
| `tasks.title` | 1–200 characters |
| `tasks.description` | ≤ 5000 characters |
| `profiles.display_name` | ≤ 100 characters |
| Tasks table | RLS enforced, single shared board |
| Avatar storage | 2 MB, PNG/JPEG/GIF/WebP only, path `avatars/{userId}/` |

## Conventions

- `.env` files and `backend/generated/prisma/` are never committed.
- Conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- Frontend `src/` is **JSX** (not TypeScript). `tsconfig.json` is for config/build tooling only.
- Frontend tests hit the real Supabase API. Before running: create `frontend/.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and ensure the dev account `dev@taskflow.local` / `devpass123` exists in the target project.
  Tests call `dotenv.config()` directly (not Vite env handling), so they work without Vite.
- No `frontend/.env.example` exists despite `docs/setup.md` referencing one — create `.env` manually.
- `supabase/seed.sql` requires at least one auth user before seeding. See `frontend/tests/api.test.js:28` for test credentials.
