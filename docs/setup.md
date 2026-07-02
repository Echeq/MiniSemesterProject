# Setup Guide

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- A **Supabase** project ([free tier](https://supabase.com) works)

---

## 1. Clone and install

```bash
git clone <repo-url>
cd PivotPoint/frontend
npm install
```

---

## 2. Get Supabase credentials

Create a free project at [database.new](https://database.new). Once it's ready, go to **Settings → API** and copy:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | "Project URL" field |
| `VITE_SUPABASE_ANON_KEY` | "Project API keys" → **anon public** key |

> [!IMPORTANT]
> Use the **anon / publishable** key. The `service_role` key bypasses Row-Level Security and must never be exposed client-side.

## 3. Configure environment

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and paste the Supabase values:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-key>
VITE_TEST_USER_EMAIL=test@example.com
VITE_TEST_USER_PASSWORD=your-password
```

Get these values from:
- **Existing project:** Ask a team member for credentials
- **New project:** [supabase.com](https://supabase.com) → Create project → Settings → API → Project URL + anon key

For local Supabase CLI:

```bash
cd supabase
supabase start
supabase db push
```

Then use the local `anon key` and `API URL` from `supabase start` output.

---

## 3. Run the app

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

If `.env` is missing or invalid, the app shows a setup hint instead of crashing.

---

## 4. First admin

The **first account to sign up** becomes `admin` automatically. To manually promote a user:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

---

## 5. Set up Supabase MCP (AI agent access)

The project uses OpenCode with a Supabase MCP server for AI-driven database operations:

```bash
opencode mcp auth supabase
```

This opens a browser to log in with your Supabase account (OAuth). No shared secrets needed.

---

## 6. Run tests

```bash
cd frontend
npm test
```

Tests use `VITE_TEST_USER_EMAIL` and `VITE_TEST_USER_PASSWORD` from `.env`. The API integration test is excluded from the default run — run it explicitly:

```bash
npx vitest run tests/api.test.js
```

---

## 7. Access from your phone (same WiFi)

1. Find your PC's local IP: `ipconfig | findstr IPv4`
2. Start the dev server (`npm run dev` — listens on all interfaces)
3. On your phone browser, go to `http://<YOUR_IP>:5173`

> Windows Firewall may block the port — allow Node.js or add an inbound rule for port 5173.

---

## Team onboarding checklist

1. Clone the repo
2. `cd frontend && npm install`
3. `cp .env.example .env` and fill in Supabase credentials
4. `opencode mcp auth supabase` — authenticate with their Supabase account
5. `npm run dev` to start developing

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/publishable key |
| `VITE_TEST_USER_EMAIL` | For tests | Auth user email for integration tests |
| `VITE_TEST_USER_PASSWORD` | For tests | Auth user password for integration tests |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| App shows "Supabase not configured" | Create `frontend/.env` with valid credentials |
| `supabase` is null | Check env vars are not empty; restart dev server |
| Can't sign up (Free tier) | Manually confirm users in Supabase Dashboard → Auth → Users |
| Phone can't connect | Ensure same WiFi; disable VPN; check firewall |
| `npm install` fails | Use Node.js 20+ and npm 10+ |
| MCP auth fails | Run `opencode mcp debug supabase` to diagnose |
---

**[? Back to Top](#) | [?? Documentation Index](INDEX.md)**

