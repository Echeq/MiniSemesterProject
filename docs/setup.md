# Setup

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node)
- Supabase account (free)

## Supabase setup

1. Create a free account at https://supabase.com
2. Create a new project
3. Copy your `URL` and `anon key` from Project Settings > API
4. Create `frontend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Backend is pure Supabase — no server code to run. Database schema and Edge Functions go in `supabase/`.

## Initialize (first time only)

```bash
cd frontend
npm create vite@latest . -- --template react
npm install supabase @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Run dev server

```bash
cd frontend
npm run dev
```
