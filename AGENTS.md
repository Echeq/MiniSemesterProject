# AGENTS.md — TaskFlow

Project state: **frontend implemented, backend is pure Supabase**. Database
schema, RLS, and realtime config live in `supabase/migrations/` (3 migration
files applied in order). See `supabase/README.md` for the full API contract.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8, Tailwind CSS v4, @dnd-kit |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Auth | Supabase Auth (email/password) |

## Commands (run from `frontend/`)

```bash
npm run dev      # Vite dev server → http://localhost:5173
npm run lint     # ESLint flat config (js, jsx)
npm run build    # production build
```

No test script exists yet.

## Architecture

- **Frontend entry:** `main.jsx` → `App.jsx` → `AuthGate` → `AuthForm` or `BoardPage`
- **Backend is pure Supabase** — there is no server to run. All CRUD goes
  through `supabase-js` with RLS enforcing access. The `backend/` directory
  is stale NestJS build artifacts (no source, no package.json); ignore it.
- **API client** (`frontend/src/api/supabaseClient.js`) returns `null` if
  `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing — the app
  renders a setup hint instead of crashing.
- **Realtime:** the `tasks` table is in the `supabase_realtime` publication
  with FULL replica identity. The `useBoard` hook subscribes to `*` changes
  on `public.tasks`.

## Drag & drop positioning scheme

`position` is a float8 column used for ordering within each Kanban column.
This is non-obvious and must be preserved when modifying drag-and-drop code:

- **New card:** `max(position)` in target column + 1024
- **Reorder between neighbors:** `(above.position + below.position) / 2`
- **Drop at end of column:** `(last position) + 1024`

Each move is a single-row UPDATE — no renumbering of other rows.

## Environment

Create `frontend/.env` (gitignored):

```env
VITE_SUPABASE_URL=https://iudqysuvrgxeaxyllfiw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_PNf2JjyVPSoz-_zZ9kH_8A_WMB8lhZn
```

The project ref is `iudqysuvrgxeaxyllfiw`. Both values are in
`docs/setup.md`. The anon key is publishable — RLS does real protection.

## AI Commands (OpenCode skills)

- `@ai-log` — Log the last interaction to `docs/log/`
- `@ai-commit` — Stage all changes, create a conventional commit (`feat:` /
  `fix:` / `chore:` / etc.)

## Gotchas

- `.env` files are never committed. However, `backend/.env` with placeholder
  values IS committed — ignore it, it has no real secrets.
- Schema migrations in `supabase/migrations/` are **already applied** to the
  team project. To add new migrations, use `npx supabase db push` after
  linking to the project ref above.
- The `frontend/src/composables/` directory exists but is empty — unused.
- `docs/structure.md` describes `backend/src/{controllers,routes,services}`
  that don't exist on disk. Trust `supabase/README.md` for schema/API info.
- Tailwind CSS v4 uses the Vite plugin (`@tailwindcss/vite`) — no
  `tailwind.config.js`, config is in `frontend/src/index.css`.
