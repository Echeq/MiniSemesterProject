# Setup Guide

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- A **Supabase** project ([free tier](https://supabase.com) works)
- A mobile device or second machine if testing LAN access

---

## 1. Clone and install

```bash
git clone <repo-url>
cd MiniSemesterProject/frontend
npm install
```

---

## 2. Configure Supabase

### Option A: Use an existing project

Copy the template and fill in credentials from a team member:

```bash
cp .env.example .env
```

Then edit `frontend/.env` with the real values.

### Option B: Create a new project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a nearby region)
3. In **Project Settings → API**, copy the **Project URL** and **anon public key**
4. Copy `.env.example` to `.env` and paste the values

### Option C: Local Supabase (CLI)

```bash
cd supabase
supabase start
supabase db push
```

Then use the local `anon key` and `API URL` from `supabase start` output in `frontend/.env`.

---

## 3. Run the app

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

If `.env` is missing or invalid, the app shows a setup hint instead of crashing.

---

## 4. Set up Supabase MCP (AI agent access)

The project uses OpenCode with a Supabase MCP server for AI-driven database operations. Each team member must authenticate individually:

```bash
opencode mcp auth supabase
```

This opens a browser to log in with your Supabase account (OAuth). No shared secrets needed.

---

## 5. Run tests

```bash
cd frontend
npm test
```

Tests hit the real Supabase API, so `.env` must have valid credentials and a test account must exist:

```bash
# Create the dev test account via Supabase Auth
# Email: dev@taskflow.local  Password: devpass123
```

---

## 6. Access from your phone (same WiFi)

1. Find your PC's local IP:
   ```bash
   ipconfig | findstr IPv4
   ```

2. Start the dev server with `npm run dev` (it listens on all interfaces)

3. On your phone browser, go to `http://<YOUR_IP>:5173`

> Windows Firewall may block the port — allow Node.js or add an inbound rule for port 5173.

---

## Team onboarding checklist

For each new team member:

1. Clone the repo
2. `cd frontend && npm install`
3. `cp .env.example .env` and fill in Supabase credentials
4. `opencode mcp auth supabase` — authenticate with their own Supabase account
5. `npm run dev` to start developing

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes | — | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | — | Supabase anon/public key |
| `VITE_API_BASE_URL` | No | `http://localhost:3000` | Legacy NestJS backend (unused) |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| App shows "Supabase not configured" | Create `frontend/.env` with valid Supabase credentials |
| `supabase` is null | Check that env vars are not empty; restart the dev server |
| Can't sign up (Free tier) | Supabase Free tier requires email confirmation. Manually confirm users in **Supabase Dashboard → Auth → Users** |
| Phone can't connect | Ensure both devices are on the same WiFi; disable VPN; check firewall |
| `npm install` fails | Use Node.js 20+ and npm 10+ |
| MCP auth fails | Run `opencode mcp debug supabase` to diagnose |
