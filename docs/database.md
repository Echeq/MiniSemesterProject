# Database

TaskFlow uses **Supabase PostgreSQL**. The schema is maintained as SQL migrations in `supabase/migrations/`.

---

## Tables

### `public.profiles`

One row per authenticated user, created automatically on sign up via a database trigger.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, references `auth.users.id` on delete cascade |
| `display_name` | `text` | Default `''`, max 100 chars |
| `avatar_url` | `text?` | Nullable |
| `role` | `text` | `'admin'` \| `'member'` \| `'unknown'`, default `'unknown'` |
| `created_at` | `timestamptz` | Default `now()` |

**RLS:**
- SELECT: all authenticated users
- UPDATE: own row only (`id = auth.uid()`), but role cannot be changed (checked in `with check`)
- UPDATE (admin): any profile, any column — admins can promote/demote users

---

### `public.tasks`

Kanban cards. The `status` enum determines which column a card appears in.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `title` | `text` | Required, 1–200 chars |
| `description` | `text` | Default `''`, max 5000 chars |
| `status` | `public.task_status` | `'todo'` \| `'doing'` \| `'done'`, default `'todo'` |
| `due_date` | `date?` | Nullable |
| `position` | `double precision` | Default `0`, fractional indexing |
| `created_by` | `uuid` | FK → `profiles.id`, immutable after insert |
| `assignee` | `uuid?` | FK → `profiles.id`, on delete set null |
| `created_at` | `timestamptz` | Default `now()`, immutable |
| `updated_at` | `timestamptz` | Default `now()`, auto-updated by trigger |

**RLS:**
- SELECT (admin): all tasks
- SELECT (member): only tasks where `assignee = auth.uid()`
- INSERT: admins only
- UPDATE: admins only
- DELETE: admins only

**Indexes:**
- `(status, position)` — efficient column queries ordered by position
- `(due_date)` where not null — due date filtering
- `(assignee)` — user filtering
- `(created_by)` — FK performance

---

### `public.invitations`

Pre-issued invitations. When a user signs up with a matching `invited_email`, the `handle_new_user` trigger sets their role to `member`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `admin_id` | `uuid` | FK → `profiles.id`, who sent the invite |
| `invited_email` | `text` | Unique — the invited user's email |
| `status` | `text` | `'pending'` \| `'accepted'` \| `'declined'`, default `'pending'` |
| `created_at` | `timestamptz` | Default `now()` |

---

### `public.join_requests`

Access requests submitted by unknown users who want to view the board.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `requester_id` | `uuid` | FK → `profiles.id` |
| `admin_email` | `text` | The admin email the user entered |
| `status` | `text` | `'pending'` \| `'resolved'`, default `'pending'` |
| `created_at` | `timestamptz` | Default `now()` |

---

## Enum

```sql
create type public.task_status as enum ('todo', 'doing', 'done');
```

This enum is used by the `tasks.status` column.

---

## Row-Level Security

TaskFlow uses a **role-based access model** with three roles:

| Role | Task visibility | Task editing |
|---|---|---|
| `admin` | All tasks | Full CRUD + assign to members |
| `member` | Only tasks assigned to them | Read-only |
| `unknown` | No tasks (empty columns) | None — sees invitation prompt |

| Table | Policy | Effect |
|---|---|---|
| `profiles` | SELECT | All authenticated users |
| `profiles` | UPDATE (own) | Own display_name/avatar_url only (role self-change prevented) |
| `profiles` | UPDATE (admin) | Any profile, any column |
| `tasks` | SELECT (admin) | All tasks |
| `tasks` | SELECT (member) | Only tasks where `assignee = auth.uid()` |
| `tasks` | INSERT | Admins only |
| `tasks` | UPDATE | Admins only |
| `tasks` | DELETE | Admins only |
| `invitations` | INSERT | Admins only |
| `invitations` | SELECT | Admins (all), users (by own email) |
| `invitations` | UPDATE | Admins only |
| `join_requests` | INSERT | Any authenticated user (own requests) |
| `join_requests` | SELECT | Own requests or all (admin) |
| `join_requests` | UPDATE | Admins only |

### Column-level permissions (tasks)

Migration `20260612120000` revokes UPDATE on the whole `tasks` table and re-grants it only for specific columns:

```sql
revoke update on table public.tasks from authenticated;
grant update (title, description, status, due_date, position, assignee)
  on table public.tasks to authenticated;
```

This makes `created_by`, `created_at`, and `updated_at` immutable after insert even for admins.

### Role assignment

- **First user** to sign up after the migration becomes `admin`
- Users invited via `invitations` table become `member` on signup
- All others default to `unknown`
- Admins can promote/demote users via Supabase dashboard or API

---

## Realtime

The `tasks` table is added to the `supabase_realtime` publication:

```sql
alter table public.tasks replica identity full;
alter publication supabase_realtime add table public.tasks;
```

`replica identity full` ensures UPDATE and DELETE events include the old row values in the broadcast payload.

---

## Migrations

Located in `supabase/migrations/` — these are the **source of truth** for the database schema.

| Migration | Description |
|---|---|---|
| `20260612100000_initial_schema.sql` | Creates `task_status` enum, `profiles` and `tasks` tables, RLS policies, Realtime publication, `handle_new_user` trigger |
| `20260612120000_backend_hardening.sql` | Column-level UPDATE revoke, adds `created_by` index, length constraints on `description` (5000) and `display_name` (100) |
| `20260612130000_fix_signup_long_display_name.sql` | Fixes signup crash when `display_name` exceeds 100 chars by truncating in the trigger |
| `20260612140000_avatars_storage.sql` | Creates `avatars` storage bucket with RLS policies for profile photos |
| `20260616100000_role_system.sql` | Adds `role` column to profiles (`admin`/`member`/`unknown`), creates `invitations` and `join_requests` tables, updates RLS for role-based task visibility |

### Apply migrations

```bash
cd supabase
supabase db push
```

---

## Seed data

`supabase/seed.sql` inserts sample tasks for local development.

```bash
supabase db seed
```

The seed is **idempotent** — it skips if any tasks already exist. It requires at least one auth user (create via Supabase CLI or dashboard).

### Seed tasks

| Title | Status |
|---|---|
| Set up Supabase project | done |
| Design Kanban board layout | done |
| Implement drag & drop | doing |
| Wire up realtime updates | doing |
| Add task due-date picker | todo |
| Mobile responsive pass | todo |

---

## Trigger: auto-create profile + role assignment

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
declare
  v_role text;
  v_invitation_id uuid;
  v_user_count int;
begin
  select count(*) into v_user_count from public.profiles;

  if v_user_count = 0 then
    v_role := 'admin';                                   -- first user ever
  else
    select id into v_invitation_id
    from public.invitations
    where invited_email = new.email
      and status = 'pending'
    limit 1;

    if v_invitation_id is not null then
      v_role := 'member';
      update public.invitations set status = 'accepted'
      where id = v_invitation_id;
    else
      v_role := 'unknown';
    end if;
  end if;

  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    left(
      coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''),
               split_part(new.email, '@', 1)),
      100
    ),
    v_role
  );
  return new;
end;
$$;
```

This fires after every sign up. Role rules:
- **First user** → `admin`
- **Pending invitation matches email** → `member`, invitation marked `accepted`
- **Everyone else** → `unknown`

The `left(..., 100)` truncation prevents the 100-char check constraint from blocking registration.

---

## Trigger: auto-update `updated_at`

```sql
create trigger on_task_updated
  before update on public.tasks
  for each row execute function public.handle_updated_at();
```

The `handle_updated_at()` function sets `new.updated_at = now()` on every UPDATE.
