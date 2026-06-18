# AGENTS.md — MiniSemesterProject

## AI Commands

- `@ai-log` — Log last interaction to `docs/log/`
- `@ai-commit` — Stage all + conventional commit

## Commands

All commands run from `frontend/`:

| Command | Action |
|---|---|
| `npm run dev` | Vite dev (port 5173, LAN via `host: true`) |
| `npm test` | Vitest (89 tests) |
| `npm run test:watch` | Vitest watch |
| `npm run build` | Vite production build |
| `npx vitest run --reporter=verbose` | All tests with names |
| `npx vitest run tests/api.test.js` | API integration tests (excluded from default) |

Supabase CLI (from root or `supabase/`):

| Command | Action |
|---|---|
| `supabase start` | Start local Supabase |
| `supabase db push` | Apply migrations |
| `supabase db reset` | Run all migrations + seed |
| `supabase db seed` | Run seed data (requires auth user) |

## Dead code — do NOT edit

| Path | Why |
|---|---|
| `backend/` | Orphaned NestJS scaffold — only dist/, generated/, node_modules/, .env remain |
| `frontend/src/composables/` | Empty directory — Vue 3 remnant |
| `frontend/src/assets/` | Empty directory — Vue 3 remnant |

## Architecture

- **Stack**: React 19 + Vite 8 + Tailwind 4 + @dnd-kit + supabase-js. Entry: `src/main.jsx` → `App.jsx`. Source is JSX (tsconfig is tooling-only).
- **Backend**: Supabase only (auth, PostgREST, realtime, storage, presence). No server.
- **DB source of truth**: `supabase/migrations/` (SQL). Never reconcile against Prisma or elsewhere.
- **Project system**: Multi-project board via `projects` table. `useBoard(projectId)` accepts `'all'`, `null` (shared board), or a project UUID. `useProjects()` lists/creates/archives/deletes projects. Tasks have `project_id` column (nullable for shared).
- **Smart views**: Client-side filters on the full board (all projects): `view:mine` (assigned to user), `view:due` (next 7 days), `view:overdue` (past due, not done).
- **Role system** (`profiles.role`): `admin` (full CRUD), `member` (read-only, own tasks), `unknown` (empty board + invite/join-request flow). First signup ever → admin. Invited email → member. Roles set via `admin_set_role` RPC.
- **RLS**: `tasks` — admins see all, members see own assigned only, unknown see none. `projects` — any authenticated user can read/create. RPC-only for project status changes (`set_project_status`). Account deletion via `delete_own_account` RPC.
- **Position system**: float8 `position`. `positionBetween()` at `frontend/src/hooks/useBoard.js:11`. Midpoint on reorder, `max + 1024` on insert. No re-indexing.
- **`created_by` immutable** via column-level grants (migration `20260612120000`). Updatable only: `title, description, status, due_date, position, assignee, project_id`.
- **DB constraints**: `title` 1-200, `description` ≤5000, `display_name` ≤100. Trigger truncates display_name on signup.
- **Realtime**: `tasks` in `supabase_realtime` publication with `replica identity full`. Frontend subscribes via `supabase.channel('board')`. On INSERT/UPDATE, re-fetches row with assignee join before merging.
- **Presence**: Real-time online user tracking via `supabase.channel('online-users')` with Presence. `usePresence()` returns a Set of online user IDs.
- **Theme**: `useTheme()` reads/writes `localStorage` key `taskflow-theme`. Respects `prefers-color-scheme`. Sets `document.documentElement.dataset.theme`.
- **i18n**: i18next + react-i18next. Locales at `src/locales/{en,es,id,zh}.json`. Language stored in `localStorage` key `lang`.
- **Test organization**: tests under `tests/{components,hooks}/` by type. `api.test.js` excluded from default vitest run.
- **@dnd-kit versions**: core@6, sortable@10, utilities@3 (incompatible majors — import carefully).
- **Migrations** (9 total):
  - `20260612100000` — initial schema (tables, RLS, realtime, triggers)
  - `20260612120000` — column-level grants, length constraints
  - `20260612130000` — fix signup crash with long display names
  - `20260612140000` — avatars storage bucket + RLS
  - `20260616100000` — role system (role column, invitations, join_requests)
  - `20260617000000` — delete_own_account RPC
  - `20260617120000` — RBAC projects + invitations revamp, `is_admin()` RPC
  - `20260617120100` — account management
  - `20260618120000` — project_members junction table, color/icon on projects
- **RPCs**: `admin_set_role(target_user, new_role)`, `set_project_status(target_project, new_status)`, `delete_own_account()`, `is_admin()`
- **project_members**: Junction table with per-project role (`admin`/`member`). Creator auto-added as admin via `handle_new_project_member()` trigger. RLS: all authenticated can read, only admins can write.

## Hooks overview

| Hook | Role |
|---|---|
| `useAuth()` | Session state + auth state listener |
| `useBoard(projectId)` | Task CRUD + realtime subscription (scoped to project) |
| `useProfile(session)` | Current user profile fetch/update |
| `useProjects()` | Project listing, create, archive, delete |
| `useMembers()` | All profiles (for assignee picker + admin panel) |
| `useTheme()` | Dark/light theme toggle (localStorage `taskflow-theme`) |
| `useTaskStats()` | Lightweight task rows for sidebar counts (listens to realtime) |
| `usePresence(session, profile)` | Online users via Realtime Presence |
| `useIsMobile()` | Breakpoint 639px for layout switch |
| `useInvitations()` | Admin-only invitation CRUD (RLS-enforced) |

## Setup gotchas

- `frontend/.env` must contain `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` + `VITE_TEST_USER_EMAIL` + `VITE_TEST_USER_PASSWORD`. Copy `frontend/.env.example` → `.env`.
- Tests load `.env` via `dotenv.config()` directly, not Vite env — they work without Vite dev server.
- Tests read `VITE_TEST_USER_EMAIL` / `VITE_TEST_USER_PASSWORD` from `.env`.
- `api.test.js` is excluded from vitest runner (`exclude` in `vitest.config.js`) — run explicitly with `npx vitest run tests/api.test.js`.
- `supabaseClient.js` exports `null` when env vars are missing — app degrades gracefully.
- `supabase/seed.sql` is idempotent but requires at least one auth user before running.
- Install dependencies from `frontend/`. Root `package-lock.json` is orphaned (gitignored).
- Vitest timeout: 15s (configured in `frontend/vitest.config.js`).
- `VITE_API_BASE_URL` is unused (legacy NestJS env var). Do not rely on it.
- `socket.io-client` in `frontend/package.json` is unused — realtime uses Supabase Realtime.

## Conventions

- `.env` files are gitignored. `backend/generated/prisma/` is NOT gitignored — do not commit it.
- Conventional commits: `feat|fix|docs|style|refactor|perf|test|chore`.
- Tailwind v4 uses `@tailwindcss/vite` plugin (no PostCSS config file).
- RLS enforced on all tables — every Supabase query runs as the signed-in user.
- Avatar bucket: `avatars/`, public read, authenticated upload at `avatars/{userId}/`.
- OpenCode config: `opencode.json` (root) + `.opencode/` (skills, scripts, plans).
- Test mock pattern: i18n intercepted via `vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))`. Supabase mocked via `createMockSupabase()` from `tests/mockSupabase.js`.
- Vitest config: `globals: true` (vi, describe, it, expect available without import), `jsdom` environment, 15s timeout.
