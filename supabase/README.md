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
| `role` | `'admin' \| 'member'` | default `member`; see Roles section below |
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

## Roles, projects, invitations & account management

Added in `20260617120000_rbac_projects_invitations.sql` and
`20260617120100_account_management.sql`.

### Roles (`profiles.role`)
`profiles` now has a `role` column: `'admin' | 'member'` (default `member`).

- **Bootstrap:** the very first account to sign up becomes `admin` automatically,
  so the team always has someone who can invite others.
- **Members** cannot change their own role (column-level grant only exposes
  `display_name` / `avatar_url`). Role changes go through `admin_set_role()`.
- The frontend can read its own role to hide admin-only UI:
  ```js
  const { data: { user } } = await supabase.auth.getUser()
  const { data: me } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = me?.role === 'admin'
  ```

**Assign a role (admin only):**
```js
await supabase.rpc('admin_set_role', { target_user: userId, new_role: 'admin' })
// throws if caller isn't an admin, or if you target your own account
```

### `projects` (admin-managed)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto |
| `name` | text | required, 1–120 chars |
| `description` | text | default `''`, ≤ 2000 |
| `status` | `'active' \| 'archived'` | |
| `created_by` | uuid → profiles | must equal `auth.uid()`; immutable |
| `created_at` / `updated_at` | timestamptz | `updated_at` auto-maintained |

RLS: **any signed-in user can read and create** projects. The **creator or an
admin** can edit `name`/`description`. **Archiving** (status change) and
**deleting** are **admin-only**.
```js
// any member
await supabase.from('projects').insert({ name, description, created_by: user.id })
await supabase.from('projects').update({ name, description }).eq('id', id)  // creator/admin
// admin only
await supabase.rpc('set_project_status', { target_project: id, new_status: 'archived' })
await supabase.from('projects').delete().eq('id', id)
```
`tasks` gained a nullable `project_id` (FK → projects, cascade delete). Existing
shared-board tasks keep `project_id = null`; any member can set/move it.

### `invitations` (admin-managed)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto |
| `email` | text | invitee's email |
| `role` | `'admin' \| 'member'` | role granted on signup |
| `status` | `'pending' \| 'accepted' \| 'revoked'` | |
| `invited_by` | uuid → profiles | must equal `auth.uid()` |
| `created_at` / `accepted_at` | timestamptz | |

RLS: **admin-only** for all of select/insert/update/delete. One outstanding
(`pending`) invite per email is enforced by a partial unique index.

**Flow:** an admin inserts an invitation; when a user signs up with that email,
the `handle_new_user` trigger reads the pending invite, applies its `role` to
the new profile, and marks the invite `accepted`.
```js
// admin invites a member with a chosen role
await supabase.from('invitations').insert({ email, role: 'member', invited_by: user.id })
// list / revoke
await supabase.from('invitations').select('*').order('created_at', { ascending: false })
await supabase.from('invitations').update({ status: 'revoked' }).eq('id', id)
```
> Sending the actual invite email (so the user can sign up) is out of scope for
> SQL — wire it to Supabase Auth `inviteUserByEmail` from an Edge Function /
> server if you want automated emails. The invite row + role assignment work
> regardless of how the user is told to sign up.

### Avatars (storage)
Public `avatars` bucket. Files live under `<user-id>/<filename>`; RLS lets a user
read any avatar but write only inside their own folder. Store the resulting public
URL in `profiles.avatar_url`.
```js
const path = `${user.id}/avatar.png`
await supabase.storage.from('avatars').upload(path, file, { upsert: true })
const { data } = supabase.storage.from('avatars').getPublicUrl(path)
await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
```

### Update display name
```js
await supabase.from('profiles').update({ display_name }).eq('id', user.id)
```

### Change password & log out (client-side Auth — no SQL)
```js
await supabase.auth.updateUser({ password: newPassword })  // change password
await supabase.auth.signOut()                              // log out
```

### Delete own account (confirmation modal → RPC)
Removing the `auth.users` row needs elevated rights, so it's a SECURITY DEFINER
RPC. It cascade-deletes the profile and everything owned by it (tasks, projects,
invitations). Blocked if the caller is the team's only admin.
```js
// after the confirmation modal is accepted
const { error } = await supabase.rpc('delete_own_account')
if (!error) await supabase.auth.signOut()
```

## Positioning scheme (drag & drop ordering)

`position` is a float per column. New cards go at `max + 1024`; dropping a
card between two others sets `(above + below) / 2`. This makes every move a
single-row UPDATE (no renumbering), which keeps realtime payloads small.

## Edge Functions

None needed for the MVP — CRUD + realtime is handled entirely by PostgREST
and RLS. If we later need server-side logic (e.g. due-date email reminders),
they go in `supabase/functions/<name>/index.ts`.
