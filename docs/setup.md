# Setup

Everything needed to run TaskFlow locally and sign in. The backend is pure
Supabase — there is no server to run, only the frontend dev server.

## Prerequisites

- Node.js (v18 or higher) and npm
- Access to the team Supabase project (you should be invited to it on supabase.com)

## 1. Get the code

```bash
git clone https://github.com/Echeq/MiniSemesterProject.git
cd MiniSemesterProject
git checkout supabase-backend
```

## 2. Configure credentials

Create `frontend/.env` (it is gitignored — never commit it):

```env
VITE_SUPABASE_URL=https://iudqysuvrgxeaxyllfiw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_PNf2JjyVPSoz-_zZ9kH_8A_WMB8lhZn
```

Both values are also visible in the Supabase dashboard under
**Project Settings → API Keys** (the publishable key is safe to share
inside the team — row level security does the real protection).

## 3. Install and run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## 4. Log in

The database schema is already applied to the team project, and a shared
dev account exists:

- **Email:** `dev@taskflow.local`
- **Password:** `devpass123`

Or click **Sign up** and create your own account. Real email addresses
must be confirmed via the email Supabase sends (the dev account is
pre-confirmed, which is why it works immediately).

Everyone shares one board — open two browser windows and drag a card to
see the realtime sync.

## Database changes (schema work only)

The schema lives in `supabase/migrations/`. It is **already applied** to
the team project — you only need this if you change the schema:

```bash
npx supabase login                          # opens browser, one time
npx supabase link --project-ref iudqysuvrgxeaxyllfiw
npx supabase db push                        # applies new migrations/
```

See `supabase/README.md` for the schema, access rules, and the full
supabase-js API contract the frontend uses.

## Recreating from scratch (new Supabase project)

Only if you can't use the team project: create a project at
https://supabase.com, put its URL/key in `frontend/.env`, then either
paste each file in `supabase/migrations/` (in order) into the dashboard
SQL Editor, or run the three commands above with your own project ref.
Sign up through the app, then run `supabase/seed.sql` in the SQL Editor
for sample tasks.
