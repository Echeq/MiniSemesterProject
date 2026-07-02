# Supabase setup

## Option A: Use the existing project (recommended)

Ask a team member for the Supabase project credentials, then create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-key>
VITE_TEST_USER_EMAIL=test@example.com
VITE_TEST_USER_PASSWORD=your-password
```

## Option B: Create a new project

1. Create a free account at https://supabase.com
2. Create a new project (choose a nearby region)
3. Go to **Project Settings > API**
4. Copy the **Project URL** and **anon publishable key**
5. Create `frontend/.env` as in Option A
6. Apply migrations: paste each file from `supabase/migrations/` into the SQL Editor, or use the CLI:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

## Option C: Local Supabase (CLI)

```bash
cd supabase
supabase start
supabase db push
supabase db seed
```

Use the local credentials from `supabase start` output.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Anon/publishable key |
| `VITE_TEST_USER_EMAIL` | For tests | Auth user email |
| `VITE_TEST_USER_PASSWORD` | For tests | Auth user password |

## Security

The anon key is safe on the client because **Row Level Security** is enforced on all tables. All queries run as the signed-in user.
---

**[? Back to Top](#) | [?? Documentation Index](../INDEX.md)**

