# AGENTS.md — MiniSemesterProject

## AI Commands

- `@ai-log` — Log last interaction to `docs/log/`
- `@ai-commit` — Stage all + conventional commit

## Commands

Run from `frontend/`:

| Command | Action |
|---|---|
| `npm run dev` | Vite dev (port 5173, `host: true` — LAN accessible) |
| `npm test` | Vitest |
| `npm run test:watch` | Vitest watch |
| `npm run build` | Vite production build |
| `npm run preview` | Vite preview |
| `npx vitest run tests/api.test.js` | API integration tests (excluded from default run) |

Supabase CLI (from root or `supabase/`):

| Command | Action |
|---|---|
| `supabase start` | Start local Supabase |
| `supabase db push` | Apply migrations |
| `supabase db reset` | Run all migrations + seed |
| `supabase db seed` | Run seed (requires auth user) |

**No lint or typecheck scripts exist.** No CI workflows either.

## Dead code — do NOT edit

| Path | Why |
|---|---|
| `backend/` | Orphaned NestJS scaffold — dist/, generated/, node_modules/, .env only |
| `frontend/src/composables/` | Empty — Vue 3 remnant |
| `frontend/src/assets/` | Empty — Vue 3 remnant |

## Architecture

- **Stack**: React 19 + Vite 8 + Tailwind 4 + @dnd-kit + supabase-js. Source is JSX (tsconfig is tooling-only typechecking).
- **Backend**: Supabase only (auth, PostgREST, realtime, storage). No custom server.
- **DB source of truth**: `supabase/migrations/` (SQL). Do not reconcile against Prisma or any other schema.
- **9 migrations** from `20260612100000` (initial schema) through `20260618120000` (project_members + project colors/icons).
- **Entry**: `src/main.jsx` → `App.jsx`. App renders a setup hint when `supabaseClient.js` exports `null` (env vars missing).
- **Root `package.json`** is a dependency stub (only `@supabase/supabase-js`). All real dependencies are in `frontend/`. Install from `frontend/`.
- **Root `package-lock.json`** is orphaned (gitignored).
- **`socket.io-client`** in `frontend/package.json` is unused — realtime uses Supabase Realtime.

### Key patterns

- **`useBoard(projectId)`** accepts `'all'`, `null` (shared board, no project), or a project UUID.
- **Smart views** are client-side filters: `view:mine` (assigned), `view:due` (≤7d), `view:overdue` (past due, not done).
- **Role system**: `admin` (full CRUD), `member` (read-only, own tasks), `unknown` (empty board + invite flow). First signup ever → admin.
- **Position system**: float8 `position`. `positionBetween()` at `frontend/src/hooks/useBoard.js:11`. Midpoint on reorder, `max + 1024` on insert. No re-indexing.
- **`created_by` immutable** via column-level grants (migration `20260612120000`). Updatable: `title, description, status, due_date, position, assignee, project_id`.
- **DB constraints**: `title` 1-200, `description` ≤5000, `display_name` ≤100 (truncated by trigger).
- **RLS**: All queries run as the signed-in user. Admins see all; members see assigned only; unknown see none.
- **RPCs**: `admin_set_role(target_user, new_role)`, `set_project_status(target_project, new_status)`, `delete_own_account()`, `is_admin()`.
- **Realtime**: `supabase.channel('board')` subscribes to `tasks` table changes. Re-fetches row with assignee join on INSERT/UPDATE before merging.
- **@dnd-kit versions**: core@6, sortable@10, utilities@3 — incompatible majors, import carefully.

## Setup gotchas

- `frontend/.env` needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TEST_USER_EMAIL`, `VITE_TEST_USER_PASSWORD`. Copy from `.env.example`.
- Tests load `.env` via `dotenv.config()` directly, not Vite env — they work without the dev server.
- `supabaseClient.js` exports `null` when env vars are missing; app degrades gracefully.
- `supabase/seed.sql` is idempotent but requires at least one auth user.
- Vitest timeout: 15s (`frontend/vitest.config.js`). Globals: true (vi, describe, it, expect available without import).
- `VITE_API_BASE_URL` is unused (legacy NestJS env var). Ignore it.

## Test conventions

- Tests in `tests/{components,hooks}/` by type. `api.test.js` is excluded from default vitest run.
- Mock i18n: `vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))`
- Mock Supabase: `createMockSupabase()` from `tests/mockSupabase.js`
