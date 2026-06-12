# MiniSemesterProject

A full-stack project with Vue 3 frontend and NestJS backend.

## Team

| Role | Name |
|------|------|
| Frontend Lead & UI Specialist | @MemerZxZ |
| Backend Lead & API Architect | @goanarbolkong |
| Project Manager & Fullstack QA | @Echeq |

## Tech Stack

- **Frontend:** Vue 3 + Vite, Pinia, Three.js / TresJS, vue-draggable-plus
- **Backend:** NestJS 11, Prisma 6, Socket.IO, Redis (ioredis)
- **Export:** xlsx, jsPDF
- **AI Assistant:** OpenCode

## Features

- Kanban board (drag & drop with vue-draggable-plus)
- 3D visualizations with Three.js / TresJS
- Real-time updates via WebSocket (Socket.IO)
- Task management with priorities, due dates, and tags
- Export to XLSX and PDF
- AI-powered development with auto-logging and auto-committing

## Prisma Schema

Six models in `backend/prisma/schema.prisma`:

- **User** — Auth, project memberships, assigned tasks
- **Project** — Kanban projects with members, columns, tasks
- **ProjectMember** — Many-to-many User ↔ Project with role
- **BoardColumn** — Named column per project mapped to a TaskStatus
- **Task** — Title, description, status, priority, due date, order, assignee, tags
- **Tag** — Many-to-many with Task

## Quick Links

| Guide | Description |
|-------|-------------|
| [Project Structure](docs/guide/structure.md) | Full directory tree |
| [Setup index](docs/setup/index.md) | Choose backend or frontend setup |
| [Backend setup](docs/setup/backend.md) | NestJS, Prisma, PostgreSQL, Redis |
| [Frontend setup](docs/setup/frontend.md) | Vue 3, Vite, dependencies |
| [Prisma schema](backend/prisma/schema.prisma) | Database models |
| [AI Guide](docs/guide/ai.md) | OpenCode, @ai-log, @ai-commit, workflow |

## AI Skills

| Skill | Trigger | What it does |
|-------|---------|-------------|
| **ai-log-generate** | `@ai-log` | Logs the last AI interaction to `docs/log/` |
| **ai-commit** | `@ai-commit` | Stages all changes and creates a conventional commit |
