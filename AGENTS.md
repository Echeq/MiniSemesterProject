# AGENTS.md — MiniSemesterProject

## AI Commands

- `@ai-log` — Log the last interaction to `docs/log/`
- `@ai-commit` — Stage all changes and create a conventional commit

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite, Pinia, Three.js / TresJS, vue-draggable-plus |
| Backend | NestJS 11, Prisma 6, Socket.IO, Redis (ioredis) |
| Export | xlsx, jsPDF |
| AI Assistant | OpenCode |

## Team

- **Frontend** (`frontend/`) — @MemerZxZ
- **Backend/API** (`backend/`) — @goanarbolkong
- **PM/QA** — @Echeq

## Commands

| Directory | Command | Action |
|---|---|---|
| `frontend/` | `npm run dev` | Start Vite dev server |
| `frontend/` | `npm run build` | Typecheck + production build |
| `backend/` | `npm run start:dev` | Start NestJS dev server |
| `backend/` | `npx prisma studio` | Open Prisma DB browser |
| `backend/` | `npx prisma migrate dev` | Run pending migrations |
| `backend/` | `npx prisma generate` | Regenerate Prisma client after schema changes |

## Prisma schema (`backend/prisma/schema.prisma`)

**Enums:** `Role`, `TaskStatus`, `Priority`, `ProjectStatus`

**Models:**
- **User** — Auth, projects (via ProjectMember), assigned tasks
- **Project** — Kanban projects with members, columns, tasks
- **ProjectMember** — Many-to-many User <-> Project with role
- **BoardColumn** — Named column mapped to a TaskStatus per project
- **Task** — Title, description, status, priority, due date, order, assignee, tags
- **Tag** — Many-to-many with Task (implicit join table)

## Architecture

### Backend (`backend/`)
- NestJS modules in `src/` (app module scaffolded, add feature modules as needed)
- Prisma service in `src/prisma/` (to be created when adding DB queries)
- Prisma Client generated to `backend/generated/prisma/` — never committed
- Socket.IO gateway in `src/gateways/` (to be created)
- `.env` vars: `DATABASE_URL` (PostgreSQL), `REDIS_URL` (Redis)

### Frontend (`frontend/`)
- Vue 3 SPA with TypeScript, Pinia stores, Vue Router
- Key dirs: `src/pages/`, `src/stores/`, `src/api/`, `src/composables/`, `src/components/`
- `.env` vars: `VITE_API_BASE_URL` (defaults to `http://localhost:3000`)

## Setup

- **`.env` files**: `frontend/.env` and `backend/.env` — never committed.
- **Backend** requires a running PostgreSQL instance (local or remote). Configure `DATABASE_URL` in `backend/.env`.
- **Redis** is required for Socket.IO adapter. Configure `REDIS_URL` in `backend/.env`.

## Conventions

- `.env` files are never committed.
- `backend/generated/prisma/` is never committed (in `.gitignore`).
- Conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- Single frontend package under `frontend/`, single backend package under `backend/` — not a monorepo.
