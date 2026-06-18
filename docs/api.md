# API Reference

TaskFlow uses **Supabase** as its primary backend. All data access goes through the Supabase JavaScript client (`@supabase/supabase-js`), which wraps Supabase Auth, PostgREST (RESTful PostgreSQL), and Realtime WebSocket channels.

We use **Thunder Client** (VS Code extension) for manual API testing — a pre-built collection is included at `docs/thunder-collection_TaskFlow-API.json`.

There is also a legacy NestJS scaffold (`backend/`) with no running services — ignore it.

---

## Supabase Client SDK

The client is initialized once in `frontend/src/api/supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && anonKey ? createClient(url, anonKey) : null
```

If `frontend/.env` is missing, `supabase` is `null` and the app renders a setup hint.

### Required environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g. `https://abc.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Anon/publishable key |
| `VITE_TEST_USER_EMAIL` | Auth user email for integration tests |
| `VITE_TEST_USER_PASSWORD` | Auth user password for integration tests |

`VITE_API_BASE_URL` is a legacy NestJS env var — do not rely on it.

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

On success, Supabase sends a confirmation email and creates a row in `public.profiles` via the `handle_new_user` trigger. **Free Tier note:** Custom SMTP is not available — manually confirm users in Supabase Dashboard under **Auth > Users**.

### Sign in

```js
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### Get current session

```js
const { data } = await supabase.auth.getSession()
// data.session — null if not signed in
```

### Listen to auth state changes

```js
supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED'
})
```

### Sign out

```js
await supabase.auth.signOut()
```

---

## Tasks API

### List all tasks (with assignee join)

```js
const { data, error } = await supabase
  .from('tasks')
  .select('*, assignee:profiles!tasks_assignee_fkey(display_name, avatar_url)')
  .order('position', { ascending: true })
```

### Create a task

```js
const { error } = await supabase.from('tasks').insert({
  title,
  description,
  due_date: dueDate || null,
  status: 'todo',
  position: maxPositionInColumn + 1024,
  created_by: user.id,
  project_id: projectId || null,
})
```

New tasks are placed at the bottom of a column by setting `position` to 1024 above the current max.

### Update a task

```js
const { error } = await supabase
  .from('tasks')
  .update({ title, description, status, due_date, position, assignee, project_id })
  .eq('id', taskId)
```

Immutable columns (silently ignored by PostgREST): `created_by`, `created_at`, `updated_at`.

### Delete a task

```js
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId)
```

### Position system (fractional indexing)

```js
function positionBetween(above, below) {
  if (above != null && below != null) return (above + below) / 2
  if (above != null) return above + 1024
  if (below != null) return below - 1024
  return 1024
}
```

Located at `frontend/src/hooks/useBoard.js:11`. Midpoint on reorder, `max + 1024` on insert. No re-indexing.

---

## Profiles API

### Get current user's profile

```js
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

### Update own profile

```js
await supabase
  .from('profiles')
  .update({ display_name: 'New Name' })
  .eq('id', userId)
```

### List all profiles

```js
const { data } = await supabase
  .from('profiles')
  .select('*')
```

---

## Projects API

### List projects

```js
const { data } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false })
```

### Create a project

```js
const { error } = await supabase.from('projects').insert({
  name,
  description,
  color: '#6366f1',
  icon: 'project',
  created_by: user.id,
})
```

Creator is auto-added as project admin via `handle_new_project_member()` trigger.

### Update project

```js
await supabase
  .from('projects')
  .update({ name, description, color, icon })
  .eq('id', projectId)
```

### Archive / restore project (admin only)

```js
await supabase.rpc('set_project_status', {
  target_project: projectId,
  new_status: 'archived',  // or 'active'
})
```

---

## Project Members API

### List project members

```js
const { data } = await supabase
  .from('project_members')
  .select('*, user:profiles!project_members_user_id_fkey(display_name, avatar_url)')
  .eq('project_id', projectId)
```

### Add/update/remove members (admin only via RLS)

```js
await supabase.from('project_members').insert({ project_id, user_id, role: 'member' })
await supabase.from('project_members').update({ role: 'admin' }).eq('id', memberId)
await supabase.from('project_members').delete().eq('id', memberId)
```

---

## RPC Functions

```js
// Check if current user is admin
await supabase.rpc('is_admin')

// Admin: set a user's role
await supabase.rpc('admin_set_role', { target_user: userId, new_role: 'admin' })

// Delete own account
await supabase.rpc('delete_own_account')
```

---

## Realtime Subscriptions

Task changes are broadcast to all connected clients via Supabase Realtime (WebSocket). No polling needed.

```js
const channel = supabase
  .channel('board')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'tasks' },
    (payload) => {
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: the new row
      // payload.old: the old row (available because replica identity full)
    },
  )
  .subscribe()

// Cleanup
return () => supabase.removeChannel(channel)
```

The `useBoard` hook handles merging Realtime payloads into local state, including re-fetching the affected row with the assignee join for INSERT/UPDATE events.

---

## Presence (Online Users)

Real-time online user tracking via Supabase Realtime Presence:

```js
const channel = supabase.channel('online-users')
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
})
```

`usePresence()` returns a Set of online user IDs.

---

## Storage (Avatars)

Public bucket `avatars/`, authenticated upload at `avatars/{userId}/`:

```js
const { error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/${fileName}`, file)

const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/${fileName}`)
```

---

## Endpoint Quick Reference

| Method | URL | Description |
|---|---|---|
| `POST` | `/auth/v1/token?grant_type=password` | Sign in with email + password |
| `GET` | `/auth/v1/user` | Get current authenticated user |
| `POST` | `/auth/v1/logout` | Sign out |
| `GET` | `/rest/v1/tasks?select=*&order=position.asc` | List all tasks |
| `GET` | `/rest/v1/tasks?select=*,assignee:profiles!tasks_assignee_fkey(display_name,avatar_url)&order=position.asc` | Tasks with assignee join |
| `GET` | `/rest/v1/tasks?id=eq.{id}&select=*` | Get task by ID |
| `POST` | `/rest/v1/tasks` | Create task |
| `PATCH` | `/rest/v1/tasks?id=eq.{id}` | Update task |
| `DELETE` | `/rest/v1/tasks?id=eq.{id}` | Delete task |
| `GET` | `/rest/v1/profiles?select=*` | List all profiles |
| `GET` | `/rest/v1/projects?select=*` | List all projects |
| `POST` | `/rest/v1/projects` | Create project |
| `PATCH` | `/rest/v1/projects?id=eq.{id}` | Update project |
| `DELETE` | `/rest/v1/projects?id=eq.{id}` | Delete project |
| `POST` | `/rest/v1/rpc/set_project_status` | Archive/restore project |
| `POST` | `/rest/v1/rpc/admin_set_role` | Admin: set user role |
| `POST` | `/rest/v1/rpc/delete_own_account` | Delete own account |

All endpoints require headers: `apikey` (anon key) and `Authorization: Bearer {token}`. URL prefix is `https://{project}.supabase.co`.

---

## Thunder Client Collection

A Thunder Client collection is available at `docs/thunder-collection_TaskFlow-API.json`. It covers Auth, Tasks, Profiles, Projects, and Project Members endpoints.

### Setup

1. Install **Thunder Client** VS Code extension
2. Import `docs/thunder-collection_TaskFlow-API.json`
3. Create a **TaskFlow** environment with:

| Variable | Value |
|---|---|
| `supabaseUrl` | Your Supabase project URL |
| `supabaseAnonKey` | Your anon/public key |
| `testUserEmail` | Auth user email |
| `testUserPassword` | Auth user password |
| `accessToken` | _(filled automatically on sign in)_ |
| `userId` | _(filled automatically on sign in)_ |
| `taskId` | _(filled after creating a task)_ |

4. Run **Sign In** first — the test script auto-sets `accessToken` and `userId`

---

## Legacy NestJS Backend

The `backend/` directory contains an empty NestJS scaffold. It has no controllers, services, or gateways. The Prisma schema (`backend/prisma/schema.prisma`) is **not** the active schema — `supabase/migrations/` is the source of truth. Do not modify `backend/`.
