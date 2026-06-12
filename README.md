# MiniSemesterProject

A Kanban board built with React 19 + Supabase.

## Team

| Role | Name |
|------|------|
| Frontend Lead & UI Specialist | @MemerZxZ |
| Backend Lead & API Architect | @goanarbolkong |
| Project Manager & Fullstack QA | @Echeq |

## Tech Stack

- **Frontend:** React 19 + Vite 8, Tailwind CSS v4, TypeScript 6, @dnd-kit
- **Backend:** Supabase (Auth, PostgREST, Realtime)
- **Export:** xlsx, jsPDF
- **AI Assistant:** OpenCode

## Features

- Kanban board (drag & drop with @dnd-kit)
- Real-time updates via Supabase Realtime
- Task management with due dates and assignments
- Export to XLSX and PDF
- AI-powered development with auto-logging and auto-committing

## Database

The database runs on **Supabase** (PostgreSQL). Migrations are in `supabase/migrations/`.

Two tables: `profiles` (one per auth user) and `tasks` (Kanban cards with status `todo`/`doing`/`done`, fractional-position ordering, and RLS policies).

## Quick Links

| Guide | Description |
|-------|-------------|
| [API Reference](docs/api.md) | Supabase auth, tasks CRUD, realtime — tested via Thunder Client |
| [Project Structure](docs/guide/structure.md) | Full directory tree |
| [Frontend setup](docs/setup/frontend.md) | React 19, Vite, dependencies |
| [Backend setup](docs/setup/backend.md) | NestJS, Prisma, PostgreSQL, Redis |
| [Supabase setup](docs/setup/supabase.md) | Supabase project, credentials, RLS |
| [AI Guide](docs/guide/ai.md) | OpenCode, @ai-log, @ai-commit, workflow |

## AI Skills

| Skill | Trigger | What it does |
|-------|---------|-------------|
| **ai-log-generate** | `@ai-log` | Logs the last AI interaction to `docs/log/` |
| **ai-commit** | `@ai-commit` | Stages all changes and creates a conventional commit |
