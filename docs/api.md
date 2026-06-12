# API Reference

TaskFlow uses **Supabase** as its primary backend. All data access goes through the Supabase JavaScript client (`@supabase/supabase-js`), which wraps Supabase Auth, PostgREST (RESTful PostgreSQL), and Realtime WebSocket channels.

There is also a legacy NestJS scaffold (`backend/`) with no running services — ignore it.

---

## Setup

The client is initialized once in `frontend/src/api/supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && anonKey ? createClient(url, anonKey) : null
```

If `frontend/.env` is missing, `supabase` is `null` and the app renders a setup hint.

Required env vars:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g. `https://abc.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key (starts with `sb_publishable_`) |
| `VITE_API_BASE_URL` | Optional, for NestJS backend (default `http://localhost:3000`) |

---

## Authentication

All API calls require an authenticated user. RLS policies reject anonymous requests.

### Sign up

```js
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { display_name } },
})
```

- On success, Supabase sends a confirmation email and creates a row in `public.profiles` via the `handle_new_user` trigger.
- Local development: create a user with the Supabase CLI (`supabase auth users create ...`).

### Sign in

```js
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
// data.session — active session object
```

### Get current session

```js
const { data } = await supabase.auth.getSession()
// data.session — null if not signed in
```

### Listen to auth state changes

```js
supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | ...
})
```

### Sign out

```js
await supabase.auth.signOut()
```

---

## Tables

### `public.profiles`

One row per authenticated user, created automatically on sign up.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, references `auth.users.id` on delete cascade |
| `display_name` | `text` | Default `''`, max 100 chars |
| `avatar_url` | `text?` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |

**RLS:**
- SELECT: all authenticated users
- UPDATE: own row only (`id = auth.uid()`)

**Fetch current user's profile:**

```js
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

**Update own display name:**

```js
await supabase
  .from('profiles')
  .update({ display_name: 'New Name' })
  .eq('id', userId)
```

---

### `public.tasks`

Kanban cards. The `status` enum value determines which column a card belongs to.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `text` | Required, 1–200 chars |
| `description` | `text` | Default `''`, max 5000 chars |
| `status` | `public.task_status` | `'todo'` \| `'doing'` \| `'done'`, default `'todo'` |
| `due_date` | `date?` | Nullable |
| `position` | `double precision` | Default `0`, fractional indexing for ordering |
| `created_by` | `uuid` | FK -> `profiles.id`, immutable after insert |
| `assignee` | `uuid?` | FK -> `profiles.id`, on delete set null |
| `created_at` | `timestamptz` | Default `now()`, immutable after insert |
| `updated_at` | `timestamptz` | Default `now()`, auto-updated by trigger |

**RLS:**
- SELECT: all authenticated users
- INSERT: `created_by` must equal `auth.uid()`
- UPDATE: any authenticated user — but `created_by`, `created_at`, `updated_at` are **column-level revoked** (see migration `20260612120000`)
- DELETE: any authenticated user

Indexes: `(status, position)`, `(due_date)` where not null, `(assignee)`, `(created_by)`

**Realtime:** The table is published to the `supabase_realtime` publication with `replica identity full`, so UPDATE/DELETE events include old column values.

#### List all tasks (with assignee profile join)

```js
const { data, error } = await supabase
  .from('tasks')
  .select('*, assignee:profiles!tasks_assignee_fkey(display_name, avatar_url)')
  .order('position', { ascending: true })
```

#### Create a task

```js
const { error } = await supabase.from('tasks').insert({
  title,
  description,
  due_date: dueDate || null,
  status: 'todo',
  position: maxPositionInColumn + 1024,
  created_by: user.id,
})
```

- New tasks are placed at the bottom of a column by setting `position` to 1024 above the current max.

#### Update a task

```js
const { error } = await supabase
  .from('tasks')
  .update({ title, description, status, due_date, position, assignee })
  .eq('id', taskId)
```

Immutable columns (silently ignored by PostgREST if included in the payload): `created_by`, `created_at`, `updated_at`.

#### Delete a task

```js
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId)
```

#### Reorder within a column (fractional indexing)

When a card is dropped between two cards, compute a midpoint position:

```js
function positionBetween(above, below) {
  if (above != null && below != null) return (above + below) / 2
  if (above != null) return above + 1024
  if (below != null) return below - 1024
  return 1024
}
```

Then call `updateTask(id, { status, position })`. This avoids re-indexing all siblings on every move.

---

## Realtime subscriptions

Task changes are broadcast to all connected clients via Supabase Realtime (WebSocket). No polling or manual refresh is needed.

### Subscribe to all task changes

```js
const channel = supabase
  .channel('board')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'tasks' },
    (payload) => {
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: the new row (INSERT/UPDATE)
      // payload.old: the old row (UPDATE/DELETE) — available because of replica identity full
    },
  )
  .subscribe()

// Cleanup
return () => supabase.removeChannel(channel)
```

The `useBoard` hook handles merging Realtime payloads into local state, including re-fetching the affected row with the assignee join for INSERT/UPDATE events.

---

## Seed data

`supabase/seed.sql` inserts sample tasks for local development:

```bash
supabase db seed
```

Requires at least one auth user. Create one locally:

```bash
supabase auth users create dev@taskflow.local --password devpass123
```

The seed is idempotent — it skips if any tasks already exist.

---

## Database migrations

Migrations live in `supabase/migrations/` and are the **source of truth** for the schema:

| File | Description |
|---|---|
| `20260612100000_initial_schema.sql` | Tables, enums, RLS, Realtime publication |
| `20260612120000_backend_hardening.sql` | Column-level revoke, FK index, length caps |
| `20260612130000_fix_signup_long_display_name.sql` | Fix signup crash on long display names |

Apply with:

```bash
supabase db push
```

---

## Thunder Client collection

A Thunder Client collection for manual API testing is available at `docs/thunder-collection_TaskFlow-API.json`. It covers Auth, Tasks, and Profiles endpoints against the Supabase REST API (`/rest/v1/`).

---

## Legacy NestJS backend

The `backend/` directory contains an empty NestJS 11 scaffold with Prisma 6. It has:
- No controllers, services, or gateways
- A Prisma schema (`backend/prisma/schema.prisma`) that mirrors the original design but is **not** the active schema
- No Prisma service

It is not used by the running application.
