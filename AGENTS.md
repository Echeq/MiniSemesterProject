# AGENTS.md — TaskFlow

Project state: **scaffold** (directories exist, no source code or package.json yet).

## Logging

After every AI interaction, type `@ai-log` to log it. Logs go to `docs/log/`.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, @dnd-kit/core |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Auth | Supabase Auth |
| Styling | Tailwind (responsive/mobile-first) |

## Team

- **Frontend** (`frontend/src/`) — @goanarbolkong
- **Backend** (Supabase) — @MemerZxZ
- **PM/QA** — @Echeq

## Setup (pending)

```
cd frontend
npm create vite@latest . -- --template react
npm install supabase @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Create `frontend/.env`:
```
VITE_SUPABASE_URL=<from Supabase project settings>
VITE_SUPABASE_ANON_KEY=<from Supabase project settings>
```

Backend is pure Supabase — no server code. Database schema and Edge Functions go in `supabase/`.

## Conventions

- `.env` files are not committed (Supabase keys stay local)
- Frontend dirs: `api/`, `components/` (with `ui/`, `kanban/`, `forms/`), `contexts/`, `hooks/`, `pages/`, `styles/`, `utils/`
- Backend dirs: `controllers/`, `middleware/`, `routes/`, `services/`, `utils/`
