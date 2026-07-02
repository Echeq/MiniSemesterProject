# PivotPoint

> A real-time Kanban board built with **React 19** and **Supabase** — drag-and-drop task management with live updates across all clients. Formerly MiniSemesterProject.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, @dnd-kit (JSX — no TS at runtime) |
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
- **Export** — download your board as Excel (.xlsx), PDF, or CSV

## Quick Start

### 1. Install

```bash
cd frontend
npm install
```

### 2. Get Supabase credentials

Create a free project at [database.new](https://database.new) (takes ~2 min). Then go to **Settings → API** and copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY` (starts with `sb_publishable_`)

### 3. Configure .env

```bash
cp .env.example .env
```

Edit `.env` and paste the two values:

```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

> [!IMPORTANT]  
> Use the **anon/publishable** key, NOT the `service_role` key. The service role bypasses database security and must stay secret.

### 4. Run

```bash
npm run dev
```

Open **http://localhost:5173** — the first user to sign up becomes admin.

> [!TIP]  
> If you see "Supabase not configured", your `.env` file is missing or has invalid credentials.

[Full setup guide →](docs/setup.md)

## Documentation

| Page | What you'll find |
|---|---|
| [Documentation Index](docs/INDEX.md) | Full categorized index of all docs |
| [Setup Guide](docs/setup.md) | Install dependencies, configure Supabase, run the project |
| [Architecture](docs/architecture.md) | How React, Supabase Auth, Realtime, and the database connect |
| [API Reference](docs/api.md) | Auth endpoints, task CRUD, realtime subscriptions, Thunder Client walkthrough |
| [Database](docs/database.md) | Tables, enums, RLS policies, migrations, and seed data |
| [Deploy Guide](docs/deploy.md) | Deploy to a new Supabase project (local, production, branches, data migration) |
| [Performance Testing](docs/reference/performance-testing.md) | 120-task performance test, optimizations, and measurement guide |
| [Project Structure](docs/guide/structure.md) | Directory tree and what each folder does |
| [AI Guide](https://github.com/Echeq/myAI-Skills) | OpenCode AI skills repository — @ai-log, @ai-commit, orchestrator, audit, docs |

## Team

| Role | Member |
|---|---|
| Frontend & Backend Lead, API Architect | @goanarbolkong |
| Frontend & Backend Support, Mobile Developer | @MemerZxZ |
| Project Manager & Fullstack QA | @Echeq |
