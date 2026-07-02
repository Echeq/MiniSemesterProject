# Database

TaskFlow uses **Supabase PostgreSQL**. The schema is maintained as SQL migrations in `supabase/migrations/`.

---

## Tables

### `public.profiles`

One row per authenticated user, created automatically on sign up via `handle_new_user()` trigger.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, references `auth.users.id` on delete cascade |
| `display_name` | `text` | Default `''`, max 100 chars (trigger truncates) |
| `avatar_url` | `text?` | Nullable |
| `role` | `text` | `'admin'` \| `'member'` \| `'unknown'`, default `'unknown'` |
| `created_at` | `timestamptz` | Default `now()` |

**RLS:**
- SELECT: all authenticated users
- UPDATE: own row only (`id = auth.uid()`), role self-change blocked
- UPDATE (admin): any profile, any column

---

### `public.tasks`

Kanban cards. The `status` enum determines which column a card belongs to.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `text` | Required, 1–200 chars |
| `description` | `text` | Default `''`, max 5000 chars |
| `status` | `public.task_status` | `'todo'` \| `'doing'` \| `'done'`, default `'todo'` |
| `due_date` | `date?` | Nullable |
| `position` | `double precision` | Default `0`, fractional indexing for ordering |
| `created_by` | `uuid` | FK → `profiles.id`, immutable after insert |
| `assignee` | `uuid?` | FK → `profiles.id`, on delete set null |
| `project_id` | `uuid?` | FK → `projects.id`, nullable (null = shared board) |
| `created_at` | `timestamptz` | Default `now()`, immutable |
| `updated_at` | `timestamptz` | Default `now()`, auto-updated by trigger |

**RLS (role-based):**
- SELECT (admin): all tasks
- SELECT (member): only tasks where `assignee = auth.uid()`
- SELECT (unknown): no tasks
- INSERT: admins only
- UPDATE: admins only
- DELETE: admins only

**Column-level permissions:** `created_by`, `created_at`, `updated_at` are immutable even for admins (migration `20260612120000`). Updatable only: `title, description, status, due_date, position, assignee, project_id`.

**Indexes:** `(status, position)`, `(due_date)` where not null, `(assignee)`, `(created_by)`, `(project_id)`

**Realtime:** Published to `supabase_realtime` with `replica identity full`.

---

### `public.projects`

Multi-project board support. Tasks can belong to a project or be shared (null `project_id`).

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | Required |
| `description` | `text?` | Nullable |
| `status` | `text` | `'active'` \| `'archived'`, default `'active'` |
| `color` | `text` | Hex color, default `'#6366f1'` |
| `icon` | `text` | Icon key, default `'project'` |
| `created_by` | `uuid` | FK → `profiles.id` |
| `created_at` | `timestamptz` | Default `now()` |

**RLS:**
- SELECT: all authenticated users
- INSERT: any authenticated user (with `created_by = auth.uid()`)
- UPDATE: admins only, status changes via `set_project_status()` RPC
- DELETE: admins only

**Column grants:** `authenticated` can update `(name, description, color, icon)` on projects.

---

### `public.project_members`

Junction table for per-project membership and roles.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `project_id` | `uuid` | FK → `projects.id` on delete cascade |
| `user_id` | `uuid` | FK → `profiles.id` on delete cascade |
| `role` | `text` | `'admin'` \| `'member'`, default `'member'` |
| `created_at` | `timestamptz` | Default `now()` |
| `unique` | — | `(project_id, user_id)` |

**Auto-add trigger:** `handle_new_project_member()` adds the project creator as an admin member on insert.

**RLS:**
- SELECT: all authenticated users
- INSERT/UPDATE/DELETE: admins only (via `is_admin()`)

Indexes: `(project_id)`, `(user_id)`

---

### `public.invitations`

Pre-issued invitations. When a user signs up with a matching email, their role is set accordingly.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `invited_email` | `text` | Unique |
| `role` | `text` | `'admin'` \| `'member'` |
| `status` | `text` | `'pending'` \| `'accepted'` \| `'declined'`, default `'pending'` |
| `invited_by` | `uuid` | FK → `profiles.id` |
| `created_at` | `timestamptz` | Default `now()` |

**RLS:** INSERT/UPDATE/DELETE admins only. SELECT admins see all, users see their own by email.

---

### `public.join_requests`

Access requests from users with `unknown` role.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `requester_id` | `uuid` | FK → `profiles.id` |
| `admin_email` | `text` | Admin email entered by requester |
| `status` | `text` | `'pending'` \| `'resolved'`, default `'pending'` |
| `created_at` | `timestamptz` | Default `now()` |

**RLS:** INSERT any authenticated user. SELECT own requests (or all for admins). UPDATE admins only.

---

## Enum

```sql
create type public.task_status as enum ('todo', 'doing', 'done');
```

---

## Row-Level Security Summary

TaskFlow uses a **role-based access model** with three roles:

| Role | Task visibility | Task editing | Projects |
|---|---|---|---|
| `admin` | All tasks | Full CRUD, assign members | Create, archive, delete |
| `member` | Only tasks assigned to them | Read-only | Create |
| `unknown` | No tasks (empty columns) | None | None — sees invitation prompt |

**Key policies:**
- `profiles`: SELECT all authenticated; UPDATE own (role self-change blocked); admins UPDATE any
- `tasks`: Role-based SELECT; admins-only INSERT/UPDATE/DELETE; column-level revoke on immutable fields
- `projects`: SELECT/INSERT all authenticated; UPDATE/DELETE admins only
- `project_members`: SELECT all authenticated; INSERT/UPDATE/DELETE admins only
- `invitations`: Admins manage; users can see their own
- `join_requests`: Users create own; admins resolve

---

## Realtime

The `tasks` table is published to `supabase_realtime` with `replica identity full`:

```sql
alter table public.tasks replica identity full;
alter publication supabase_realtime add table public.tasks;
```

This ensures UPDATE and DELETE events include old row values.

---

## RPC Functions

| Function | Purpose |
|---|---|
| `is_admin()` | SECURITY DEFINER — checks if current user is admin (used by RLS) |
| `admin_set_role(target_user uuid, new_role text)` | Set a user's role (admin only) |
| `set_project_status(target_project uuid, new_status text)` | Archive/restore projects (admin only) |
| `delete_own_account()` | Delete current user's account and data |
| `delete_account()` | Legacy wrapper for `delete_own_account` |
| `log_activity(p_action text, p_target_type text, p_target_id uuid, p_metadata jsonb)` | Insert audit log row |
| `get_logs(p_user_id uuid, p_action text, p_date_from timestamptz, p_date_to timestamptz)` | List filtered logs (admin only) |
| `restore_from_backup(data jsonb)` | Restore projects, tasks, labels from JSON backup (admin only) |
| `get_profile_preferences(target_user_id uuid)` | Get user UI preferences as JSON |
| `set_profile_preferences(target_user_id uuid, prefs jsonb)` | Set user UI preferences |
| `check_blocked_tasks(target_task_id uuid)` | Return incomplete dependencies blocking a task |
| `add_task_dependency(p_task_id uuid, p_depends_on_id uuid)` | Add a dependency link with circular check |
| `export_all_data()` | Return full user-scoped data as JSON (projects, tasks, labels, members) |
| `get_filtered_tasks(p_status, p_priority, p_assignee, p_date_from, p_date_to, p_label_ids, p_order_by, p_order_dir)` | Server-side filtered task query |
| `get_notifications(target_user_id uuid)` | Get unread notifications for a user |

---

## Migrations (14 total)

Located in `supabase/migrations/` — **source of truth** for the schema:

| Migration | Description |
|---|---|
| `20260612100000_initial_schema.sql` | `task_status` enum, `profiles` and `tasks` tables, RLS, Realtime publication, `handle_new_user` trigger |
| `20260612120000_backend_hardening.sql` | Column-level UPDATE revoke, FK index, length caps (title 1–200, desc ≤5000, display_name ≤100) |
| `20260612130000_fix_signup_long_display_name.sql` | Fix signup crash when display_name exceeds 100 chars (trigger truncation) |
| `20260612140000_avatars_storage.sql` | `avatars` storage bucket with RLS policies |
| `20260616100000_role_system.sql` | `role` column, `invitations` and `join_requests` tables, role-based RLS |
| `20260617000000_delete_account_rpc.sql` | `delete_own_account()` RPC |
| `20260617120000_rbac_projects_invitations.sql` | RBAC for projects + invitations revamp, `is_admin()` RPC |
| `20260617120100_account_management.sql` | Account management improvements |
| `20260618120000_project_members_and_colors.sql` | `project_members` junction table, `color`/`icon` on projects |
| `20260625000002_logs_and_preferences.sql` | `system_logs` table, `get_logs`/`get_profile_preferences`/`set_profile_preferences` RPCs, `preferences` column on profiles |
| `20260625000003_restore_backup.sql` | `restore_from_backup()` RPC |
| `20260625000004_system_config.sql` | `system_config` table for app-wide key-value settings |
| `20260625000005_fix_notify_due_soon_null_assignee.sql` | Fix `notify_due_soon()` to skip tasks with no assignee |
| `20260627000001_capture_mcp_rpcs.sql` | `notifications` table, circular dependency trigger, `add_task_dependency`/`check_blocked_tasks`/`export_all_data`/`get_filtered_tasks`/`get_notifications`/`log_activity` RPCs |

Apply with:
```bash
supabase db push
```

---

## Seed Data

`supabase/seed.sql` inserts 6 sample tasks for local development:

| Title | Status |
|---|---|
| Set up Supabase project | done |
| Design Kanban board layout | done |
| Implement drag & drop | doing |
| Wire up realtime updates | doing |
| Add task due-date picker | todo |
| Mobile responsive pass | todo |

```bash
supabase db seed
```

Requires at least one auth user. The seed is **idempotent** (skips if any tasks exist).

---

## Trigger: `handle_new_user()`

Fires after every sign up. Role logic:
- **First user ever** → `admin`
- **Pending invitation matches email** → `member`, invitation marked `accepted`
- **Everyone else** → `unknown`

Also truncates `display_name` to 100 chars to prevent check constraint violations.

## Trigger: `handle_new_project_member()`

Fires after project insert. Automatically adds the creator (`created_by`) as a `project_members` row with role `admin`.

## Trigger: `handle_updated_at()`

Sets `new.updated_at = now()` on every task UPDATE.
---

**[? Back to Top](#) | [?? Documentation Index](INDEX.md)**

