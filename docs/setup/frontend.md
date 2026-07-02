# Frontend Setup

## Prerequisites

- Node.js >= 18
- A Supabase project (local or remote)

## Step 1: Install dependencies

```bash
cd frontend
npm install
```

## Step 2: Configure environment variables

```bash
cp .env.example .env
```

Edit `frontend/.env` with your Supabase project credentials:

```ini
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

### How to find your Supabase credentials

1. Go to the **Supabase Dashboard** → [database.new](https://database.new) (create a project if needed)
2. In your project, click **Settings** (gear icon) in the left sidebar
3. Click **API** in the menu
4. Copy these two values:

   | Variable | Where to find it |
   |---|---|
   | `VITE_SUPABASE_URL` | "Project URL" — e.g. `https://abc...supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | "Project API keys" → **anon public** key (starts with `sb_publishable_` or `eyJ`) |

   > [!IMPORTANT]
   > Use the **anon / publishable** key, NOT the `service_role` key.
   > The anon key is safe for client-side use. The `service_role` key bypasses RLS and must stay secret.

## Step 3: Start the dev server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

> [!TIP]
> If you see a "Supabase not configured" page, your `.env` file is missing or incomplete.
> Make sure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.

## Available commands

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173, LAN accessible) |
| `npm test` | Run Vitest unit tests (excludes API tests) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Create production build |
| `npm run preview` | Preview the production build |
| `npx vitest run tests/api.test.js` | Run API integration tests |

---

**[⬆ Back to Top](#) | [📂 Documentation Index](../INDEX.md)**
