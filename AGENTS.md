# AGENTS.md — MiniSemesterProject

## AI Commands

- `@ai-log` — Log last interaction to `docs/log/`
- `@ai-commit` — Stage all + conventional commit

## Commands

| Directory | Command | Action |
|---|---|---|
| `frontend/` | `npm run dev` | Vite dev server (needs `.env`) |
| `frontend/` | `npm test` | Vitest run (needs `.env` — hits real Supabase) |
| `frontend/` | `npm run test:watch` | Vitest watch |
| `backend/` | `npm run start:dev` | NestJS dev server (--watch) |
| `backend/` | `npm run build` | Compile to `dist/` |
| `backend/` | `npm run lint` | ESLint --fix (flat config) |
| `backend/` | `npm test` | Jest (`*.spec.ts` in `src/`) |
| `backend/` | `npm run test:e2e` | Jest e2e (`*.e2e-spec.ts`) |
| `backend/` | `npx prisma generate` | Regenerate client to `generated/prisma/` |
| `backend/` | `npx prisma migrate dev` | Run pending Prisma migrations |
| `supabase/` | `supabase start` | Start local Supabase |
| `supabase/` | `supabase db reset` | Run all migrations + seed |

## Dead code — do NOT edit

| Path | Why |
|---|---|
| `backend/` | NestJS scaffold with empty AppModule (hello world only). Prisma client deps installed but nothing wired. |
| `frontend/src/main.ts`, `App.vue`, `style.css`, `stores/`, `pages/`, `composables/` | Vue 3 remnants after React migration |
| `frontend/vite.config.ts` | Vue plugin config — use `vite.config.js` (React + Tailwind) instead |
| `backend/prisma/schema.prisma` | Stale original design — NOT the active schema (see Supabase migrations) |

## Architecture

- **Frontend** = React 19 + Vite 8 + Tailwind 4 + @dnd-kit + Supabase JS. Entry: `src/main.jsx` → `App.jsx`. Frontend `src/` is JSX (tsconfig is build-tooling only).
- **Backend** = Supabase (auth, PostgREST, realtime, storage). NestJS (`backend/`) is an unbuilt scaffold — do not touch.
- **DB** = two separate schemas: active Supabase migrations (`supabase/migrations/`), stale Prisma schema (`backend/prisma/schema.prisma`). Never reconcile them.
- **@dnd-kit versions**: core@6, sortable@10, utilities@3 (incompatible majors — be careful with imports).
- **Position system**: float8 `position` column, midpoint on reorder (`positionBetween` at `frontend/tests/api.test.js:234`). No re-indexing.
- **Role system** (`profiles.role`): `admin` (full CRUD), `member` (read-only, own tasks), `unknown` (empty board + invite popup). First signup → admin. Invited signups → member.

## Setup gotchas

- `frontend/.env` must contain `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. No `.env.example` exists — create manually.
- Dev test account: `dev@taskflow.local` / `devpass123` (pre-confirmed in target Supabase project).
- Tests call `dotenv.config()` directly (not Vite env), so they work without Vite.
- `supabase/seed.sql` is idempotent but requires at least one auth user before running.
- Prisma 6 in `backend/` requires `prisma.config.ts` (not auto-detected). Output goes to `backend/generated/prisma/` (gitignored).

## Conventions

- `.env` files and `backend/generated/prisma/` are gitignored — never commit.
- Conventional commits: `feat|fix|docs|style|refactor|perf|test|chore`.
- Tailwind v4 uses `@tailwindcss/vite` plugin (not PostCSS config file).
- Avatar bucket: `avatars/`, public read, authenticated upload at `avatars/{userId}/`, max 2 MB, PNG/JPEG/GIF/WebP only.
- RLS enforced on all tables — every Supabase query runs as the signed-in user.
- OpenCode config lives in `.opencode/` (no root opencode.json).
