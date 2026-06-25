# PivotPoint

> A real-time Kanban board built with **React 19** and **Supabase** — drag-and-drop task management with live updates across all clients. Formerly MiniSemesterProject.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, TypeScript 6, @dnd-kit |
| Backend | Supabase (Auth, PostgREST, Realtime, PostgreSQL) |
| Testing | Vitest 4, Thunder Client |
| AI Tooling | OpenCode (@ai-log, @ai-commit, Supabase MCP) |

[Architecture →](docs/architecture.md)

## Features

- **Drag-and-drop Kanban** — reorder cards and move between columns using @dnd-kit
- **Real-time sync** — every change broadcasts instantly via Supabase Realtime
- **User authentication** — sign up and sign in with Supabase Auth
- **Task management** — titles, descriptions, due dates, and assignees
- **Mobile responsive** — adaptive layout for phones and tablets
- **Export** — download your board as XLSX or PDF

## Quick Start

```bash
cd frontend
npm install
# Create frontend/.env with Supabase credentials
cp .env.example .env    # or create manually
npm run dev
```

> **Prerequisites:** Node.js 20+, Supabase project (free tier works).

[Full setup guide →](docs/setup.md)

## Documentation

| Page | What you'll find |
|---|---|---|
| [Setup Guide](docs/setup.md) | Install dependencies, configure Supabase, run the project |
| [Architecture](docs/architecture.md) | How React, Supabase Auth, Realtime, and the database connect |
| [API Reference](docs/api.md) | Auth endpoints, task CRUD, realtime subscriptions, Thunder Client walkthrough |
| [Database](docs/database.md) | Tables, enums, RLS policies, migrations, and seed data |
| [Deploy Guide](docs/deploy.md) | Deploy to a new Supabase project (local, production, branches, data migration) |
| [Performance Testing](docs/reference/performance-testing.md) | 120-task performance test, optimizations, and measurement guide |
| [Project Structure](docs/guide/structure.md) | Directory tree and what each folder does |
| [AI Guide](docs/guide/ai.md) | OpenCode workflow, @ai-log, @ai-commit |

## Team

| Role | Member |
|---|---|
| Frontend & Backend Lead, API Architect | @goanarbolkong |
| Frontend & Backend Support, Mobile Developer | @MemerZxZ |
| Project Manager & Fullstack QA | @Echeq |
