# TaskFlow Backend (Supabase)

The backend is pure Supabase — no server to run. Everything lives in this folder:

```
supabase/
├── migrations/
│   └── 20260612100000_initial_schema.sql   # tables, RLS, triggers, realtime
├── seed.sql                                # sample tasks for local dev
└── README.md                               # this file (schema + API contract)
```

## Applying the schema

**Option A — Supabase dashboard (quickest):**
Open your project → SQL Editor → paste the contents of
`migrations/20260612100000_initial_schema.sql` → Run.

**Option B — Supabase CLI:**
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies migrations/
```

## Schema

### `profiles`
Created automatically on signup via trigger — never insert manually.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `display_name` | text | defaults to email prefix |
| `avatar_url` | text \| null | |
| `created_at` | timestamptz | |

### `tasks`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto-generated |
| `title` | text | required, 1–200 chars |
| `description` | text | defaults to `''` |
| `status` | `'todo' \| 'doing' \| 'done'` | the Kanban column |
| `due_date` | date \| null | |
| `position` | float8 | sort order within a column (see below) |
| `created_by` | uuid → profiles | must equal `auth.uid()` on insert |
| `assignee` | uuid → profiles \| null | |
| `created_at` / `updated_at` | timestamptz | `updated_at` auto-maintained by trigger |

### Access rules (RLS)
Single shared team board: **any signed-in user can read/create/update/delete
all tasks**. Anonymous users get nothing. `created_by` must be your own id
on insert and is immutable afterwards (column-level grants only allow updating
`title`, `description`, `status`, `due_date`, `position`, `assignee`).
Profiles: everyone signed in can read all; you can only update your own.
Free-text caps: `title` ≤ 200, `description` ≤ 5000, `display_name` ≤ 100.

## API contract (supabase-js)

```js
// frontend/src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Fetch the board** (ordered for rendering):
```js
const { data, error } = await supabase
  .from('tasks')
  .select('*, assignee:profiles!tasks_assignee_fkey(display_name, avatar_url)')
  .order('position', { ascending: true })
```

**Create a task:**
```js
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('tasks').insert({
  title, description, due_date,        // due_date: 'YYYY-MM-DD' or null
  status: 'todo',
  position: maxPositionInColumn + 1024,
  created_by: user.id,
})
```

**Drag & drop** (move card to another column / reorder):
```js
// position: midpoint between the two neighbouring cards at the drop point,
// or (last position + 1024) when dropped at the end of a column
await supabase.from('tasks')
  .update({ status: 'doing', position: newPosition })
  .eq('id', taskId)
```

**Delete:**
```js
await supabase.from('tasks').delete().eq('id', taskId)
```

**Realtime** — the `tasks` table is in the `supabase_realtime` publication
with FULL replica identity, so all change events carry full row data:
```js
const channel = supabase
  .channel('board')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },
      (payload) => { /* payload.eventType, payload.new, payload.old */ })
  .subscribe()
// cleanup: supabase.removeChannel(channel)
```

**Auth:**
```js
await supabase.auth.signUp({ email, password, options: { data: { display_name } } })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
```

## Positioning scheme (drag & drop ordering)

`position` is a float per column. New cards go at `max + 1024`; dropping a
card between two others sets `(above + below) / 2`. This makes every move a
single-row UPDATE (no renumbering), which keeps realtime payloads small.

## Edge Functions

None needed for the MVP — CRUD + realtime is handled entirely by PostgREST
and RLS. If we later need server-side logic (e.g. due-date email reminders),
they go in `supabase/functions/<name>/index.ts`.
