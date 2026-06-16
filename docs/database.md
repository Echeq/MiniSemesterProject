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
| `created_at` | `timestamptz` | Default `now()` |

**RLS:**
- SELECT: all authenticated users
- UPDATE: own row only (`id = auth.uid()`)

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
- SELECT: all authenticated users
- INSERT: `created_by` must equal `auth.uid()`
- UPDATE: any authenticated user — but `created_by`, `created_at`, `updated_at` are **column-level revoked**
- DELETE: any authenticated user

**Indexes:**
- `(status, position)` — efficient column queries ordered by position
- `(due_date)` where not null — due date filtering
- `(assignee)` — user filtering
- `(created_by)` — FK performance

---

## Enum

```sql
create type public.task_status as enum ('todo', 'doing', 'done');
```

This enum is used by the `tasks.status` column.

---

## Row-Level Security

TaskFlow uses a **shared board model** — any signed-in user can see and manage all tasks. Anonymous users see nothing.

| Table | Policy | Effect |
|---|---|---|
| `profiles` | SELECT | All authenticated users |
| `profiles` | UPDATE | Own profile only |
| `tasks` | SELECT | All authenticated users |
| `tasks` | INSERT | `created_by` must match `auth.uid()` |
| `tasks` | UPDATE | Any authenticated user (limited writable columns) |
| `tasks` | DELETE | Any authenticated user |

### Column-level permissions

Migration `20260612120000` revokes UPDATE on the whole `tasks` table and re-grants it only for specific columns:

```sql
revoke update on table public.tasks from authenticated;
grant update (title, description, status, due_date, position, assignee)
  on table public.tasks to authenticated;
```

This makes `created_by`, `created_at`, and `updated_at` immutable after insert.

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
|---|---|
| `20260612100000_initial_schema.sql` | Creates `task_status` enum, `profiles` and `tasks` tables, RLS policies, Realtime publication, `handle_new_user` trigger |
| `20260612120000_backend_hardening.sql` | Column-level UPDATE revoke, adds `created_by` index, length constraints on `description` (5000) and `display_name` (100) |
| `20260612130000_fix_signup_long_display_name.sql` | Fixes signup crash when `display_name` exceeds 100 chars by truncating in the trigger |

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

The seed is **idempotent** — it skips if any tasks already exist. It requires at least one auth user:

```bash
supabase auth users create dev@taskflow.local --password devpass123
```

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

## Trigger: auto-create profile

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''),
               split_part(new.email, '@', 1)),
      100
    )
  );
  return new;
end;
$$;
```

This fires after every sign up. The `left(..., 100)` truncation prevents the 100-char check constraint from blocking registration.

---

## Trigger: auto-update `updated_at`

```sql
create trigger on_task_updated
  before update on public.tasks
  for each row execute function public.handle_updated_at();
```

The `handle_updated_at()` function sets `new.updated_at = now()` on every UPDATE.
