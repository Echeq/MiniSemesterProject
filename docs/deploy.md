# Deployment Guide

## Overview

TaskFlow is a **React SPA** backed entirely by **Supabase** — no custom server. Deploying to a new Supabase project means:

1. Create a new Supabase project
2. Apply the SQL migrations (tables, RLS, triggers, RPCs, storage)
3. Point the frontend at the new project's URL and anon key

```
┌─────────────────────┐     ┌──────────────────────────────────┐
│  Browser (React SPA) │────▶│         Supabase                 │
│  ┌───────────────┐   │     │  ┌────────────┐ ┌────────────┐   │
│  │  Vite build   │   │     │  │ PostgREST  │ │  Realtime  │   │
│  │  (dist/)      │   │     │  │ (REST API) │ │ (WebSocket)│   │
│  └───────────────┘   │     │  └────────────┘ └────────────┘   │
│                      │     │  ┌────────────┐ ┌────────────┐   │
│  Hosted on:          │     │  │   Auth     │ │  Storage   │   │
│  Vercel / Netlify    │     │  └────────────┘ └────────────┘   │
│  / Cloudflare / S3   │     └──────────────────────────────────┘
└─────────────────────┘
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| npm | 10+ | ships with Node.js |
| Supabase CLI | latest | `npm install -g supabase` |
| Git | latest | [git-scm.com](https://git-scm.com) |
| psql (optional) | 16+ | for data migration |

Verify:
```bash
node --version    # v20+
npm --version     # v10+
supabase --version
```

---

## Configuration reference

Every Supabase project needs these values. You'll use them throughout this guide.

| Variable | Where to find it |
|---|---|
| **Project Reference ID** | Dashboard → Project Settings → General → Reference ID |
| **Project URL** | Dashboard → Project Settings → API → Project URL |
| **Anon Key** | Dashboard → Project Settings → API → anon public key |
| **DB Password** | The password you set when creating the project |
| **DB Connection String** | Dashboard → Project Settings → Database → Connection string (URI) |

---

# Ruta A: Local Development

Recommended for local testing, preview environments, and onboarding.

## 1. Create a new Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Enter:
   - **Name**: `taskflow-dev`
   - **Database Password**: create a strong password
   - **Region**: pick one close to you
3. Wait for provisioning (~1-2 minutes)

## 2. Link and apply migrations

```bash
cd PivotPoint

# Authenticate the CLI
supabase login

# Link to your new project
supabase link --project-ref <project-ref>

# Apply all 10 migrations (tables, RLS, triggers, RPCs, storage)
supabase db push
```

Expected output: each migration applied in order, finishing with `Finished supabase db push`.

## 3. Disable email confirmation (dev convenience)

1. Dashboard → **Authentication** → **Settings**
2. Toggle **Confirm email** → **OFF**
3. Save

Without this, every test account needs manual email confirmation.

## 4. Create a test user and seed data

```bash
# Option A: Register via the app (easier)
#   Start the app (step 5), sign up, then run:
supabase db seed

# Option B: Create via Dashboard
#   Dashboard → Authentication → Users → Add user
supabase db seed
```

The seed creates 6 sample tasks assigned to the first user found.

## 5. Configure and start the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```ini
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_TEST_USER_EMAIL=test@example.com
VITE_TEST_USER_PASSWORD=your-password
```

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The first user to sign up becomes **admin**.

## 6. Verify

```bash
npm test                      # 82 unit tests
npx vitest run tests/api.test.js  # API integration tests
```

---

# Ruta B: Production Deploy

## 1. Create a production Supabase project

Same steps as Ruta A step 1, but choose a region close to your users.

## 2. Link and apply migrations

```bash
supabase login
supabase link --project-ref <prod-ref>
supabase db push
```

**Do NOT run `supabase db seed`** in production unless you want sample data.

## 3. Configure Authentication for production

Dashboard → **Authentication** → **Settings**:

| Setting | Value |
|---|---|
| Confirm email | **ON** |
| Site URL | `https://yourdomain.com` |
| Redirect URLs | `https://yourdomain.com/**` |
| Security → JWT expiry | adjust as needed (default 1 hour) |

Optional: enable OAuth providers (Google, GitHub, etc.) under **Authentication → Providers**.

## 4. Configure CORS

Dashboard → **Project Settings** → **API** → **CORS**:

```
https://yourdomain.com
https://yourdomain.com/*
```

(Also keep `http://localhost:5173` if you want local dev to still work.)

## 5. Build and deploy the frontend

```bash
cd frontend
npm install
npm run build
```

The output `frontend/dist/` is a static site. Deploy it to any static host.

### Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel --prod
# Set environment variables in Vercel Dashboard:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
```

Or connect your Git repository in [vercel.com](https://vercel.com) → New project → import → set env vars.

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=frontend/dist
# Set env vars via Netlify Dashboard → Site settings → Environment variables
```

### Deploy manually (any static host)

Upload `frontend/dist/` to any web server or CDN (Cloudflare Pages, AWS S3 + CloudFront, etc.) and set the two env vars on your host.

## 6. Verify production

1. Visit your production URL
2. Register a real user — **check your email for the confirmation link**
3. After confirming email, sign in
4. Create a task, change its status, verify Realtime updates

---

# Ruta C: Supabase Branches (preview environments)

Great for PR previews and staging environments.

```bash
# Create a branch (creates an isolated DB with all migrations applied)
supabase branches create staging-v2
```

Each branch gets its own project reference. Use it with preview deployments (Vercel Preview, Netlify Deploy Previews):

```bash
# In your preview deploy script:
supabase link --project-ref <branch-ref>
# The branch automatically has all migrations from the main project
```

Clean up when done:
```bash
supabase branches delete <branch-ref>
```

---

# Data migration (optional)

If you want to copy **data** (not just schema) from an existing project to a new one:

## Using the migration script

```bash
# 1. Link to the SOURCE project
supabase link --project-ref <source-ref>

# 2. Run the script
./scripts/migrate-supabase-data.sh
```

The script will:
1. Dump all data from the source project
2. Prompt for the target DB connection string
3. Apply schema to the target (optional)
4. Restore data

## Manual approach

```bash
# Dump source data
supabase db dump --data-only -f data.sql

# Get target connection string from Dashboard → Database → Connection string
psql "postgresql://postgres:<password>@<host>:<port>/postgres" -f data.sql
```

**Note:** Auth users cannot be migrated this way (passwords are hashed). Users must re-register on the new project.

---

# Scripts reference

| Script | Purpose | When to use |
|---|---|---|
| `scripts/deploy-supabase.sh` | Interactive deploy (local or prod) | First-time setup |
| `scripts/deploy-supabase.ps1` | Same, for Windows PowerShell | First-time setup on Windows |
| `scripts/migrate-supabase-data.sh` | Copy data between projects | Migrating from old project |

Run the deploy scripts from the repository root:
```bash
# Unix / Git Bash
chmod +x scripts/deploy-supabase.sh
./scripts/deploy-supabase.sh

# Windows PowerShell
.\scripts\deploy-supabase.ps1
```

---

# Post-deploy checklist

Use this to verify everything works after deployment.

## Schema & API

| Item | Check | Command / Action |
|---|---|---|
| Migrations applied | All PASS | `supabase db push` (no pending) |
| Tables exist | 10+ tables | Dashboard → Table Editor |
| RLS active | All policies | Dashboard → Database → Policies |
| RPCs exist | 10+ functions | Dashboard → Database → Functions |
| Realtime publication | `supabase_realtime` includes `tasks` | Dashboard → Database → Publications |
| Storage bucket | `avatars` exists | Dashboard → Storage |

## Frontend

| Item | Check | Action |
|---|---|---|
| App loads | No setup hint | Visit URL |
| Sign up | Creates profile | Register |
| Admin role | First user is admin | Check Sidebar → Admin panel |
| Create task | Appears in board | Click "+ New task" |
| Drag & drop | Moves between columns | Drag a card |
| Realtime | Other clients update | Open in 2 tabs |
| Smart views | Filters work | "My tasks", "Overdue" |
| Export | PDF/CSV download | Click Export |
| Labels | CRUD per project | Topbar → label icon |
| Dependencies | Blocked badge | TaskModal → "Blocked by" |
| Presence | Online indicators | Check Sidebar → Team |
| Theme toggle | Light/dark persists | Toggle in Topbar |

## Security

| Item | Check | Action |
|---|---|---|
| Anon key | Public only (no service_role) | Check Dashboard → API |
| RLS blocks anon | Empty data when logged out | Open incognito tab |
| Column grants | `created_by` immutable | Try editing via API |
| Admin RPC | Non-admin cannot escalate | Try `admin_set_role` as member |

---

# Environment reference

## frontend/.env

```ini
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_TEST_USER_EMAIL=test@example.com
VITE_TEST_USER_PASSWORD=test-password
```

| Variable | Required for | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | App, tests | From Dashboard → API |
| `VITE_SUPABASE_ANON_KEY` | App, tests | From Dashboard → API |
| `VITE_TEST_USER_EMAIL` | Integration tests | Must exist in Auth |
| `VITE_TEST_USER_PASSWORD` | Integration tests | For sign-in |

## Host environment variables (Vercel / Netlify / etc.)

Set these in your host's dashboard:

```
VITE_SUPABASE_URL=https://<prod-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<prod-anon-key>
```

No `VITE_TEST_USER_*` needed on production hosts.

---

# Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| App shows "Supabase not configured" | `.env` missing or invalid | Create `frontend/.env` with valid URL + key |
| "relation does not exist" | Migrations not applied | Run `supabase db push` |
| "column does not exist" | Outdated migration | Run `supabase db push` to catch up |
| RLS blocks everything | User not in `profiles` | Sign up through the app (not direct DB insert) |
| First user is not admin | Another admin already exists | Run `supabase db reset` (dev) or promote manually |
| Realtime not updating | Publication missing `tasks` table | Dashboard → Database → Publications → add `tasks` |
| Seed fails | No auth user exists | Register first, then run seed |
| CORS error in browser | Allowed origins doesn't include your domain | Update Dashboard → API → CORS |
| Email not sent | Auth settings misconfigured | Check Site URL and redirect URLs |
| `supabase link` asks for password repeatedly | Wrong password | Reset in Dashboard → Database → Reset password |
| Branch not found | Branch name typo | `supabase branches list` to see available branches |

---

# Related documentation

| Document | What it covers |
|---|---|
| `docs/setup.md` | Quick-start local development |
| `docs/architecture.md` | How the system is wired together |
| `docs/database.md` | Tables, enums, RLS policies in detail |
| `docs/api.md` | Auth, CRUD, Realtime, RPCs |
| `supabase/README.md` | Per-table schema reference |
| `AGENTS.md` | Developer commands and conventions |
