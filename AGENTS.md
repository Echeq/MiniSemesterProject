# AGENTS.md — TaskFlow

Project state: **scaffold** (no source code or package.json yet).

## AI Commands

- `@ai-log` — Log the last interaction to `docs/log/`
- `@ai-commit` — Stage all changes and create a conventional commit

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, @dnd-kit/core |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Auth | Supabase Auth |

## Team

- **Frontend** (`frontend/src/`) — @goanarbolkong
- **Backend** (Supabase) — @MemerZxZ
- **PM/QA** — @Echeq

## Setup

```bash
cd frontend
npm create vite@latest . -- --template react
npm install supabase @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Create `frontend/.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

**Gotcha:** Backend is pure Supabase — no server code. The `backend/src/` subdirectories (controllers, routes, services) exist only for Edge Functions. Schema goes in `supabase/`.

## Conventions

- `.env` files are never committed.
