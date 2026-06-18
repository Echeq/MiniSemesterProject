-- TaskFlow: role-based access control, projects, and team invitations
-- Adds admin/member roles, an admin-managed projects table, a team
-- invitation flow, and the RLS that ties them together.
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

-- ============================================================
-- 1. Roles (admin / member)
-- ============================================================
create type public.app_role as enum ('admin', 'member');

alter table public.profiles
  add column role public.app_role not null default 'member';

comment on column public.profiles.role is
  'App-wide role. admin = can manage the team, assign roles, and manage projects.';

-- is_admin(): SECURITY DEFINER so RLS policies can check the caller's
-- role without recursing back into the profiles RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ============================================================
-- 2. Lock down role changes (no self-escalation)
--    Members may edit only their own display_name / avatar_url.
--    Role assignment goes exclusively through admin_set_role().
--    (PostgREST honours column-level grants.)
-- ============================================================
revoke update on table public.profiles from authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

create or replace function public.admin_set_role(
  target_user uuid,
  new_role public.app_role
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can assign roles' using errcode = '42501';
  end if;
  if target_user = (select auth.uid()) then
    raise exception 'Admins cannot change their own role' using errcode = '42501';
  end if;

  update public.profiles set role = new_role where id = target_user;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_set_role(uuid, public.app_role) from public;
grant execute on function public.admin_set_role(uuid, public.app_role) to authenticated;

-- ============================================================
-- 3. Projects — admin-managed, visible to the whole team
-- ============================================================
create type public.project_status as enum ('active', 'archived');

create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  status      public.project_status not null default 'active',
  created_by  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.projects is 'Kanban projects. Managed by admins, visible to all members.';

create index projects_status_idx on public.projects (status);
create index projects_created_by_idx on public.projects (created_by);

create trigger on_project_updated
  before update on public.projects
  for each row execute function public.handle_updated_at();

alter table public.projects enable row level security;

create policy "Authenticated users can view projects"
  on public.projects for select
  to authenticated
  using (true);

create policy "Members can create projects"
  on public.projects for insert
  to authenticated
  with check (created_by = (select auth.uid()));

-- The creator (or any admin) may edit a project's name/description.
create policy "Creators and admins can update projects"
  on public.projects for update
  to authenticated
  using (public.is_admin() or created_by = (select auth.uid()))
  with check (public.is_admin() or created_by = (select auth.uid()));

create policy "Admins can delete projects"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- Members may edit only name/description. created_by/timestamps are
-- immutable, and status (archive) is admin-only via set_project_status().
revoke update on table public.projects from authenticated;
grant update (name, description) on table public.projects to authenticated;

-- Archiving / restoring a project is admin-only.
create or replace function public.set_project_status(
  target_project uuid,
  new_status public.project_status
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change a project status' using errcode = '42501';
  end if;

  update public.projects set status = new_status where id = target_project;
  if not found then
    raise exception 'Project not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_project_status(uuid, public.project_status) from public;
grant execute on function public.set_project_status(uuid, public.project_status) to authenticated;

-- ============================================================
-- 4. Link tasks to a project (nullable: existing shared-board
--    tasks keep working with project_id = null)
-- ============================================================
alter table public.tasks
  add column project_id uuid references public.projects (id) on delete cascade;

create index tasks_project_id_idx on public.tasks (project_id);

-- allow members to set/move a task's project (column-level grant,
-- in addition to the existing title/description/status/... grants)
grant update (project_id) on table public.tasks to authenticated;

-- ============================================================
-- 5. Team invitations — admins invite by email with a role
-- ============================================================
create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  email       text not null check (char_length(email) between 3 and 320),
  role        public.app_role not null default 'member',
  status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'revoked')),
  invited_by  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  accepted_at timestamptz
);

comment on table public.invitations is 'Pending/accepted team invitations created by admins.';

-- Only one outstanding invite per email.
create unique index invitations_pending_email_idx
  on public.invitations (lower(email)) where status = 'pending';
create index invitations_email_idx on public.invitations (lower(email));
create index invitations_invited_by_idx on public.invitations (invited_by);

alter table public.invitations enable row level security;

create policy "Admins can view invitations"
  on public.invitations for select
  to authenticated
  using (public.is_admin());

create policy "Admins can create invitations"
  on public.invitations for insert
  to authenticated
  with check (public.is_admin() and invited_by = (select auth.uid()));

create policy "Admins can update invitations"
  on public.invitations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete invitations"
  on public.invitations for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- 6. Wire invitations + bootstrap into signup
--    - First ever user becomes admin (so the team always has one).
--    - A pending invitation for the signup email sets the new user's
--      role and is marked accepted.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  invited_role public.app_role;
begin
  -- Role from a matching pending invitation, if any.
  select role into invited_role
  from public.invitations
  where lower(email) = lower(new.email) and status = 'pending'
  limit 1;

  -- Bootstrap: the very first account is always an admin.
  if not exists (select 1 from public.profiles where role = 'admin') then
    invited_role := 'admin';
  end if;

  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    left(
      coalesce(
        nullif(new.raw_user_meta_data ->> 'display_name', ''),
        split_part(new.email, '@', 1)
      ),
      100
    ),
    coalesce(invited_role, 'member')
  );

  -- Consume the invitation.
  update public.invitations
  set status = 'accepted', accepted_at = now()
  where lower(email) = lower(new.email) and status = 'pending';

  return new;
end;
$$;
