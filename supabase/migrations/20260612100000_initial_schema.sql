-- TaskFlow initial schema
-- Tables: profiles, tasks
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

-- ============================================================
-- 1. Enum: task status (Kanban columns)
-- ============================================================
create type public.task_status as enum ('todo', 'doing', 'done');

-- ============================================================
-- 2. Profiles — one row per auth user
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data for each auth user.';

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 3. Tasks — the Kanban cards
-- ============================================================
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  status      public.task_status not null default 'todo',
  due_date    date,
  -- Sort order within a column. Frontend inserts at (max + 1024) and uses
  -- midpoints when dropping between two cards, so reordering is one UPDATE.
  position    double precision not null default 0,
  created_by  uuid not null references public.profiles (id) on delete cascade,
  assignee    uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.tasks is 'Kanban cards. status = column, position = order within column.';

create index tasks_status_position_idx on public.tasks (status, position);
create index tasks_due_date_idx on public.tasks (due_date) where due_date is not null;
create index tasks_assignee_idx on public.tasks (assignee);

-- Keep updated_at fresh
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_task_updated
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 4. Row Level Security
--    TaskFlow is a single shared team board: any signed-in user
--    can see and manage all tasks. Anonymous users see nothing.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- Profiles
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Tasks
create policy "Authenticated users can view tasks"
  on public.tasks for select
  to authenticated
  using (true);

create policy "Authenticated users can create tasks as themselves"
  on public.tasks for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "Authenticated users can update tasks"
  on public.tasks for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete tasks"
  on public.tasks for delete
  to authenticated
  using (true);

-- ============================================================
-- 5. Realtime — broadcast task changes to all connected clients
-- ============================================================
-- FULL replica identity so UPDATE/DELETE events include old values
alter table public.tasks replica identity full;

alter publication supabase_realtime add table public.tasks;
