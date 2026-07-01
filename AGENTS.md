# AGENTS.md — PivotPoint

## AI Commands

- `@ai-log` — Log last interaction to `docs/log/` (ai-docs skill)
- `@ai-commit` — Stage all + conventional commit (ai-git skill)

## Commands

Run from `frontend/`:

| Command | Action |
|---|---|
| `npm run dev` | Vite dev (port 5173, `host: true`, `usePolling: true` — LAN accessible) |
| `npm test` | Vitest (excludes `**/api.test.js`) |
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

Deploy scripts at `scripts/deploy-supabase.{sh,ps1}` (interactive, prompts for project ref). Performance test at `scripts/test-performance.sh`.

**No npm scripts for lint or typecheck** (flat eslint config — run `npx eslint` if needed). CI at `.github/workflows/ci.yml`: tests + build on push/PR to `main`.

## Dead code — do NOT edit

| Path | Why |
|---|---|
| `backend/` | Orphaned NestJS scaffold (gitignored, only `generated/prisma/` remains on disk) |

## Architecture

See `docs/architecture.md` for diagrams and full detail. Quick reference:

- **Stack**: React 19 + Vite 8 + Tailwind 4 + @dnd-kit + supabase-js. Source is JSX (tsconfig is tooling-only typecheck).
- **Backend**: Supabase only (auth, PostgREST, realtime, storage, presence). No custom server.
- **DB source of truth**: `supabase/migrations/` (SQL). 29 migrations from `20260612100000` → `20260630120000`.
- **Supabase MCP applies migrations remotely** — it does NOT write to `supabase/migrations/`. After MCP migrations, run `supabase db pull` locally or copy the SQL into a file to prevent drift.
- **Entry**: `src/main.jsx` → `App.jsx`. App renders a setup hint when `supabaseClient.js` exports `null` (env vars missing).
- **Root `package.json`** is a dependency stub (only `@supabase/supabase-js` and MCP devDep). All real dependencies in `frontend/`. Install from `frontend/`.
- **Root `package-lock.json`** is orphaned (gitignored).
- **Supabase MCP** is pre-configured in `opencode.json` (remote mode) — agents can run SQL, deploy functions, etc.

### Key patterns

- **`useBoard(projectId)`** accepts `'all'`, `null` (shared board, no project), or a project UUID.
- **Smart views** are client-side filters: `view:mine` (assigned), `view:due` (≤7d), `view:overdue` (past due, not done).
- **Role system**: `admin` (full CRUD), `member` (view tasks in projects + shared board; drag-and-drop only — cannot edit details), `unknown` (empty board, can submit join requests). First signup ever → admin. New signups default to `unknown` via `handle_new_user()` trigger. Admin promotes via `admin_set_role` RPC or Requests tab.
- **Position system**: float8 `position`. `positionBetween()` at `frontend/src/hooks/useBoard.js:9`. Midpoint on reorder, `max + 1024` on insert. No re-indexing.
- **`created_by` immutable** via column-level grants. Updatable on tasks: `title, description, status, due_date, position, assignee, project_id, priority`.
- **DB constraints**: `title` 1-200, `description` ≤5000, `display_name` ≤100 (truncated by trigger).
- **Priority**: P0 (critical) / P1 (high) / P2 (medium) / P3 (low). Nullable text with DB `CHECK` constraint.
- **Labels + dependencies**: `labels`, `task_labels`, `task_dependencies` tables. `useBoard` provides `addLabel`, `removeLabel`, `addDependency`, `removeDependency`. Moving a task to `done` calls `check_blocked_tasks` RPC — throws if blockers remain.
- **Project members**: `project_members` table. Creator auto-added as admin via trigger. RLS: members only see their projects; admins see all.
- **@dnd-kit versions**: core@6, sortable@10, utilities@3 — incompatible majors, import carefully.
- **i18n**: 5 locales (en, es, zh, id, ar). `ar` is RTL. Language persisted to localStorage under `lang` key.
- **Theme**: CSS custom properties + `[data-theme]` on `<html>`. Light/dark toggle via `useTheme()` hook. Persisted to localStorage under `taskflow-theme`.
- **Views**: Kanban (default), Gantt chart (`frappe-gantt`), 3D sphere (`three`). Switched via `activeView` state in `App.jsx`.
- **Keyboard shortcuts**: `Ctrl/Cmd+N` new task, `Ctrl/Cmd+F` focus filter input (defined in `App.jsx`).
- **Export**: XLSX via `exceljs`, PDF via `jspdf` (ExportMenu component).

> Full schema, RPCs, and API contract documented in `supabase/README.md`.

## Setup gotchas

- `frontend/.env` needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TEST_USER_EMAIL`, `VITE_TEST_USER_PASSWORD`. Copy from `frontend/.env.example`. The live env uses a modern `sb_publishable_` key.
- Tests load `.env` via `dotenv.config()` directly, not Vite env — they work without the dev server.
- `supabaseClient.js` exports `null` when env vars are missing; app degrades gracefully.
- `supabase/seed.sql` is idempotent but requires at least one auth user.
- Vitest timeout: 15s (`frontend/vitest.config.js`). Globals: true (vi, describe, it, expect available without import).
- `VITE_API_BASE_URL` is unused (legacy NestJS env var). Ignore it.
- **Playwright** is in devDependencies but no test files exist — unused dependency.

## Test conventions

- Tests in `tests/{components,hooks}/` by type. `api.test.js` excluded from default run (run explicitly via `npx vitest run tests/api.test.js`). Standalone unit tests: `i18n.test.js` (at `tests/`), `positionBetween.test.js` (at `tests/hooks/`).
- Mock i18n: `vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))` or import `mockI18n.js` for richer translations.
- Mock Supabase: `createMockSupabase()` from `tests/mockSupabase.js` provides chainable query builder (`.select()`, `.single()`, `.is()`, `.match()`, `.in()`) plus `auth`, `channel`, `storage`, `rpc` mocks.
- Test setup (`tests/setup.js`) provides fake `localStorage`/`sessionStorage` and `matchMedia` — needed because `i18n.js` reads `localStorage` at module init.
