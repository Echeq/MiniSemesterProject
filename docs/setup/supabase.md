# Supabase setup

## Option A: Use the existing project (recommended)

If another team member has already created the Supabase project, ask them for these credentials from **Project Settings > API**:

- **Project URL** — `https://xxxxx.supabase.co`
- **anon public key** — Public key starting with `sb_publishable_...`

Then create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

## Option B: Create a new project

1. Create a free account at https://supabase.com
2. Create a new project (choose a nearby region)
3. Once created, go to **Project Settings > API**
4. Copy the **Project URL** and **anon public key**
5. Create `frontend/.env` as in Option A

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes | — | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | — | Anon public key |
| `VITE_API_BASE_URL` | No | `http://localhost:3000/api` | Only if using a custom backend |

## Security

The **anon key** is safe to use on the client because Supabase uses **Row Level Security (RLS)** on tables. If RLS is not configured, tables are protected by default. Consult the backend lead (@goanarbolkong) before modifying RLS policies.

## Backend

The backend is pure Supabase — no server to run. Database schemas live in `supabase/` and Edge Functions in `backend/src/`.
