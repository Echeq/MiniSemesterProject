# Supabase setup

## Option A: Use the existing project (recommended)

Ask a team member for the Supabase project credentials, then create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

## Option B: Create a new project

1. Create a free account at https://supabase.com
2. Create a new project (choose a nearby region)
3. Go to **Project Settings > API**
4. Copy the **Project URL** and **anon public key**
5. Create `frontend/.env` as in Option A
6. Apply migrations: paste each file from `supabase/migrations/` into the SQL Editor, or use the CLI:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Anon public key |
| `VITE_TEST_USER_EMAIL` | For tests | Auth user email |
| `VITE_TEST_USER_PASSWORD` | For tests | Auth user password |
| `VITE_API_BASE_URL` | No | Legacy NestJS (unused) |

## Security

The anon key is safe on the client because **Row Level Security** is enforced on all tables.
