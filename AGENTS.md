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

- **Frontend** (`frontend/src/`) — @MemerZxZ
- **Backend** (Supabase) — @goanarbolkong
- **PM/QA** — @Echeq

## Setup

See:

- [Supabase setup](docs/setup/supabase.md) — Create project, get API keys, `.env`
- [npm setup](docs/setup/npm.md) — Scaffold Vite, install deps, run dev server

**Gotcha:** Backend is pure Supabase — no server code. The `backend/src/` subdirectories (controllers, routes, services) exist only for Edge Functions. Schema goes in `supabase/`.

## Conventions

- `.env` files are never committed.
