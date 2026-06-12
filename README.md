# TaskFlow - Visual Task Manager

A simple task management system with a Kanban board for small teams.
Works on desktop and mobile phones.

## Team

| Role | Name |
|------|------|
| Frontend Lead & UI Specialist | @MemerZxZ |
| Backend Lead & API Architect | @goanarbolkong |
| Project Manager & Fullstack QA | @Echeq |

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, @dnd-kit/core
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **AI Assistant:** OpenCode

## Features

- Create, edit, delete tasks
- Kanban board (To Do / Doing / Done)
- Drag & drop between columns
- Task due dates, real-time updates, mobile friendly
- AI-powered development with auto-logging and auto-committing

## Quick Links

| Guide | Description |
|-------|-------------|
| [Project Structure](docs/guide/structure.md) | Full directory tree |
| [Setup index](docs/setup/index.md) | Choose Supabase or npm setup guide |
| [Supabase setup](docs/setup/supabase.md) | Create project, get API keys, .env |
| [npm setup](docs/setup/npm.md) | Install dependencies and run the project |
| [AI Guide](docs/guide/ai.md) | OpenCode, @ai-log, @ai-commit, workflow |

## AI Skills

| Skill | Trigger | What it does |
|-------|---------|-------------|
| **ai-log-generate** | `@ai-log` | Logs the last AI interaction to `docs/log/` |
| **ai-commit** | `@ai-commit` | Stages all changes and creates a conventional commit |
