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
| [Project Structure](docs/structure.md) | Full directory tree |
| [Setup & Run](docs/setup.md) | Prerequisites, Supabase, dev server |
| [AI Guide](docs/ai-guide.md) | OpenCode, @ai-log, @ai-commit, workflow |

## AI Skills

| Skill | Trigger | What it does |
|-------|---------|-------------|
| **ai-log-generate** | `@ai-log` | Logs the last AI interaction to `docs/log/` |
| **ai-commit** | `@ai-commit` | Stages all changes and creates a conventional commit |
