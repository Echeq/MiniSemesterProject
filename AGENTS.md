# AGENTS.md — MiniSemesterProject

## AI Commands

- `@ai-log` — Log last interaction to `docs/log/`
- `@ai-commit` — Stage all + conventional commit

## Commands

| Directory | Command | Action |
|---|---|---|
| `frontend/` | `npm run dev` | Vite dev (port 5173, LAN via `host: true`) |
| `frontend/` | `npm test` | Vitest (needs `.env` — hits real Supabase) |
| `frontend/` | `npm run test:watch` | Vitest watch |
| `frontend/` | `npm run build` | Vite production build |
| `frontend/` | `npx vitest run --reporter=verbose` | Single test |
| `backend/` | `npm run start:dev` | NestJS dev server (--watch) |
| `backend/` | `npm run build` | Compile to `dist/` |
| `backend/` | `npm run lint` | ESLint --fix (flat config) |
| `backend/` | `npm test` | Jest (`*.spec.ts`) |
| `backend/` | `npm run test:e2e` | Jest e2e (`*.e2e-spec.ts`) |
| `supabase/` | `supabase start` | Start local Supabase |
| `supabase/` | `supabase db reset` | Run all migrations + seed |

Tests read test credentials from `VITE_TEST_USER_EMAIL` / `VITE_TEST_USER_PASSWORD` in `.env`.

## Dead code — do NOT edit

| Path | Why |
|---|---|
| `backend/` | NestJS scaffold — empty AppModule, never wired |
| `frontend/src/main.ts`, `App.vue`, `style.css`, `stores/`, `pages/`, `composables/` | Vue 3 remnants after React migration |
| `frontend/vite.config.ts` | Vue plugin config — use `vite.config.js` (React + Tailwind) |
| `backend/prisma/schema.prisma` | Stale original design — active schema is `supabase/migrations/` |
| `frontend/src/api/client.ts` | Legacy NestJS fetch wrapper — app uses `supabase-js` directly |
| dep `socket.io-client` (frontend) / `socket.io` (backend) | Unused — realtime is Supabase Realtime |

## Architecture

- **Stack**: React 19 + Vite 8 + Tailwind 4 + @dnd-kit + supabase-js. Entry: `src/main.jsx` → `App.jsx`. Frontend `src/` is JSX (tsconfig is build-tooling only).
- **Backend**: Supabase only (auth, PostgREST, realtime, storage). NestJS in `backend/` is dead scaffold.
- **DB source of truth**: `supabase/migrations/` (SQL). Prisma schema is stale — never reconcile.
- **Role system** (`profiles.role`): `admin` (full CRUD), `member` (read-only, own tasks), `unknown` (empty board + invite/join-request flow). First signup ever → admin. Invited email → member.
- **Position system**: float8 `position` column. `positionBetween()` at `frontend/src/hooks/useBoard.js:9`. Midpoint on reorder, `max + 1024` on insert. No re-indexing.
- **`created_by` immutable** via column-level grants (migration `20260612120000`). Updatable only: `title, description, status, due_date, position, assignee`.
- **DB constraints**: `title` 1-200, `description` ≤5000, `display_name` ≤100. Trigger truncates display_name on signup to prevent registration failures.
- **Realtime**: `tasks` in `supabase_realtime` publication with `replica identity full`. Frontend subscribes via `supabase.channel('board')` — no Socket.IO server.
- **i18n**: i18next + react-i18next. Locales at `src/locales/{en,es,id,zh}.json`. Language stored in `localStorage` key `lang`.
- **@dnd-kit versions**: core@6, sortable@10, utilities@3 (incompatible majors — import carefully).

## Setup gotchas

- `frontend/.env` must contain `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Copy `frontend/.env.example` → `.env` and fill credentials.
- Supabase MCP (`opencode.json`) usa OAuth individual — cada miembro ejecuta `opencode mcp auth supabase` con su propia cuenta.
- `VITE_API_BASE_URL` (default `http://localhost:3000`) is for legacy NestJS — unused. Do not rely on it.
- Tests load `.env` via `dotenv.config()` directly (not Vite env), so they work without Vite dev server.
- Tests read test credentials from `VITE_TEST_USER_EMAIL` / `VITE_TEST_USER_PASSWORD` in `.env`.
- `supabase/seed.sql` is idempotent but requires at least one auth user before running.
- `supabaseClient.js` exports `null` when env vars are missing — the app degrades gracefully.
- Install dependencies from `frontend/`. Root `package-lock.json` is an orphaned artifact (gitignored).
- Vitest timeout: 15s (configured in `frontend/vitest.config.js`).
- Account deletion RPC: migration `20260617000000`.

## Conventions

- `.env` files and `backend/generated/prisma/` are gitignored — never commit.
- Conventional commits: `feat|fix|docs|style|refactor|perf|test|chore`.
- Tailwind v4 uses `@tailwindcss/vite` plugin (no PostCSS config file).
- RLS enforced on all tables — every Supabase query runs as the signed-in user.
- Avatar bucket: `avatars/`, public read, authenticated upload at `avatars/{userId}/`.
- OpenCode config: `opencode.json` (root) + `.opencode/` (skills, scripts).
- NestJS scaffold in `backend/` is dead code — do not touch its Prettier/ESLint config.
