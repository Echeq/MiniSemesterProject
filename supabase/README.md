# TaskFlow Backend (Supabase)

The backend is pure Supabase — no server to run. Everything lives in this folder:

```
supabase/
├── migrations/            # SQL migrations (schema source of truth)
│   ├── 20260612100000_initial_schema.sql
│   ├── 20260612120000_backend_hardening.sql
│   ├── 20260612130000_fix_signup_long_display_name.sql
│   ├── 20260612140000_avatars_storage.sql
│   ├── 20260616100000_role_system.sql
│   ├── 20260617000000_delete_account_rpc.sql
│   ├── 20260617120000_rbac_projects_invitations.sql
│   └── 20260617120100_account_management.sql
├── seed.sql               # sample tasks for local dev
└── README.md              # this file
```

## Applying the schema

**Dashboard (quickest):** Open your project → SQL Editor → paste each migration file in filename order → Run.

**CLI:**
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## Schema

### `profiles`
Created automatically on signup via trigger — never insert manually.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `display_name` | text | max 100 chars, defaults to email prefix |
| `avatar_url` | text \| null | |
| `role` | text | `'admin' \| 'member' \| 'unknown'`, default `'unknown'` |
| `created_at` | timestamptz | |

### `tasks`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto-generated |
| `title` | text | required, 1–200 chars |
| `description` | text | defaults to `''`, max 5000 |
| `status` | `'todo' \| 'doing' \| 'done'` | the Kanban column |
| `due_date` | date \| null | |
| `position` | float8 | sort order within a column |
| `created_by` | uuid → profiles | must equal `auth.uid()` on insert; immutable |
| `assignee` | uuid → profiles \| null | |
| `project_id` | uuid → projects \| null | |
| `created_at` / `updated_at` | timestamptz | `updated_at` auto-maintained by trigger |

### `projects`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto |
| `name` | text | required, 1–120 chars |
| `description` | text | default `''`, ≤ 2000 |
| `status` | `'active' \| 'archived'` | |
| `created_by` | uuid → profiles | immutable |
| `created_at` / `updated_at` | timestamptz | |

### `invitations`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto |
| `email` | text | invitee's email |
| `role` | `'admin' \| 'member'` | role granted on signup |
| `status` | `'pending' \| 'accepted' \| 'revoked'` | |
| `invited_by` | uuid → profiles | must equal `auth.uid()` |
| `created_at` / `accepted_at` | timestamptz | |

### `join_requests`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto |
| `requester_id` | uuid → profiles | |
| `admin_email` | text | admin to notify |
| `status` | `'pending' \| 'resolved'` | default `'pending'` |
| `created_at` | timestamptz | |

## Access rules (RLS)

### Role-based access

| Role | Task visibility | Task editing |
|---|---|---|
| `admin` | All tasks | Full CRUD + assign |
| `member` | Only assigned tasks | Read-only |
| `unknown` | No tasks (empty columns) | None — sees invitation prompt |

### Column-level permissions (tasks)

Only `title, description, status, due_date, position, assignee` are updatable.
`created_by`, `created_at`, `updated_at` are immutable after insert (revoked at column level).

### Role assignment

- **First user** to sign up → `admin`
- **Pending invitation matches email** → `member`
- **Everyone else** → `unknown`
- Admins can promote/demote via `admin_set_role()` RPC

## API contract (supabase-js)

```js
// frontend/src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Fetch board** (ordered for rendering):
```js
const { data, error } = await supabase
  .from('tasks')
  .select('*, assignee:profiles!tasks_assignee_fkey(display_name, avatar_url)')
  .order('position', { ascending: true })
```

**Create task:**
```js
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('tasks').insert({
  title, description, due_date,
  status: 'todo',
  position: maxPositionInColumn + 1024,
  created_by: user.id,
})
```

**Drag & drop:**
```js
await supabase.from('tasks')
  .update({ status: 'doing', position: newPosition })
  .eq('id', taskId)
```

**Delete:**
```js
await supabase.from('tasks').delete().eq('id', taskId)
```

**Realtime** — `tasks` table in `supabase_realtime` publication with FULL replica identity:
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

**Check role:**
```js
const { data: me } = await supabase
  .from('profiles').select('role').eq('id', user.id).single()
const isAdmin = me?.role === 'admin'
```

**Assign role (admin only):**
```js
await supabase.rpc('admin_set_role', { target_user: userId, new_role: 'admin' })
```

**Delete own account (confirmation modal → RPC):**
```js
const { error } = await supabase.rpc('delete_own_account')
if (!error) await supabase.auth.signOut()
```

## Positioning scheme

`position` is a float per column. New cards go at `max + 1024`; dropping between two cards sets `(above + below) / 2`. Every move is a single-row UPDATE.
