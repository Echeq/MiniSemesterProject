# AGENTS.md — MiniSemesterProject

## AI Commands

- `@ai-log` — Log last interaction to `docs/log/`
- `@ai-commit` — Stage all + conventional commit

## Commands

All commands run from `frontend/`:

| Command | Action |
|---|---|
| `npm run dev` | Vite dev (port 5173, LAN via `host: true`) |
| `npm test` | Vitest (requires `.env` — hits real Supabase) |
| `npm run test:watch` | Vitest watch |
| `npm run build` | Vite production build |
| `npx vitest run --reporter=verbose` | Single test |

Supabase CLI (from root or `supabase/`):

| Command | Action |
|---|---|
| `supabase start` | Start local Supabase |
| `supabase db reset` | Run all migrations + seed |

## Dead code — do NOT edit

| Path | Why |
|---|---|
| `backend/` | Orphaned NestJS scaffold dir — no source remains (only dist/, generated/, node_modules/) |
| `frontend/src/composables/` | Empty directory — Vue 3 remnant |
| `frontend/src/api/supabaseClient.js` is the real API client | `src/api/` only has one file |
| `socket.io-client` dep in `frontend/package.json` | Unused — realtime is Supabase Realtime |
| `vite.config.ts` (does not exist) | Only `vite.config.js` (React + Tailwind) is active |

## Architecture

- **Stack**: React 19 + Vite 8 + Tailwind 4 + @dnd-kit + supabase-js. Entry: `src/main.jsx` → `App.jsx`. Source is JSX (tsconfig is tooling-only).
- **Backend**: Supabase only (auth, PostgREST, realtime, storage). No server.
- **DB source of truth**: `supabase/migrations/` (SQL). Never reconcile against Prisma or elsewhere.
- **Role system** (`profiles.role`): `admin` (full CRUD), `member` (read-only, own tasks), `unknown` (empty board + invite/join-request flow). First signup ever → admin. Invited email → member.
- **Position system**: float8 `position` column. `positionBetween()` at `frontend/src/hooks/useBoard.js:11`. Midpoint on reorder, `max + 1024` on insert. No re-indexing.
- **`created_by` immutable** via column-level grants (migration `20260612120000`). Updatable only: `title, description, status, due_date, position, assignee`.
- **DB constraints**: `title` 1-200, `description` ≤5000, `display_name` ≤100. Trigger truncates display_name on signup.
- **Realtime**: `tasks` in `supabase_realtime` publication with `replica identity full`. Frontend subscribes via `supabase.channel('board')`.
- **i18n**: i18next + react-i18next. Locales at `src/locales/{en,es,id,zh}.json`. Language stored in `localStorage` key `lang`.
- **@dnd-kit versions**: core@6, sortable@10, utilities@3 (incompatible majors — import carefully).

## Setup gotchas

- `frontend/.env` must contain `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Copy `frontend/.env.example` → `.env`.
- Tests load `.env` via `dotenv.config()` directly, not Vite env — they work without Vite dev server.
- Tests read `VITE_TEST_USER_EMAIL` / `VITE_TEST_USER_PASSWORD` from `.env`.
- `api.test.js` is excluded from the vitest runner (`exclude` in `vitest.config.js`) — run it explicitly: `npx vitest run tests/api.test.js`.
- `supabaseClient.js` exports `null` when env vars are missing — app degrades gracefully.
- `supabase/seed.sql` is idempotent but requires at least one auth user before running.
- Install dependencies from `frontend/`. Root `package-lock.json` is orphaned (gitignored).
- Vitest timeout: 15s (configured in `frontend/vitest.config.js`).
- Account deletion RPC: migration `20260617000000`.
- `VITE_API_BASE_URL` is unused (legacy NestJS env var). Do not rely on it.

## Conventions

- `.env` files and `backend/generated/prisma/` are gitignored — never commit.
- Conventional commits: `feat|fix|docs|style|refactor|perf|test|chore`.
- Tailwind v4 uses `@tailwindcss/vite` plugin (no PostCSS config file).
- RLS enforced on all tables — every Supabase query runs as the signed-in user.
- Avatar bucket: `avatars/`, public read, authenticated upload at `avatars/{userId}/`.
- OpenCode config: `opencode.json` (root) + `.opencode/` (skills, scripts, plans).
