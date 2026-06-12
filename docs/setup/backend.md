# Backend setup

## Prerequisites

- Node.js (v20+)
- PostgreSQL instance (local or remote, e.g. Supabase)
- Redis instance (local or remote, e.g. Redis Cloud / Upstash)

## Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://user:password@host:6379
```

## Run Prisma migrations

```bash
npx prisma migrate dev
npx prisma generate
```

## Start dev server

```bash
npm run start:dev
```

## Available commands

| Command | Action |
|---|---|
| `npm run start:dev` | Start NestJS in watch mode |
| `npx prisma studio` | Open Prisma DB browser |
| `npx prisma migrate dev` | Run pending migrations |
| `npx prisma generate` | Regenerate Prisma client |
