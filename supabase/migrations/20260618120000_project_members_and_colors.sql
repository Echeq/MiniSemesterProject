-- TaskFlow: project_members junction table, color/icon on projects
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

-- ============================================================
-- 1. Add color and icon columns to projects
-- ============================================================
alter table public.projects
  add column if not exists color text not null default '#6366f1',
  add column if not exists icon  text not null default 'project';

comment on column public.projects.color is 'Hex color for the project badge/sidebar';
comment on column public.projects.icon  is 'Icon key (project, globe, etc.) for the sidebar';

grant update (name, description, color, icon) on table public.projects to authenticated;

-- ============================================================
-- 2. Project members — who belongs to which project
-- ============================================================
create table if not exists public.project_members (
  id         uuid    primary key default gen_random_uuid(),
  project_id uuid    not null references public.projects (id) on delete cascade,
  user_id    uuid    not null references public.profiles  (id) on delete cascade,
  role       text    not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

comment on table public.project_members is 'Membership and per-project role for each project.';

create index if not exists project_members_project_idx on public.project_members (project_id);
create index if not exists project_members_user_idx    on public.project_members (user_id);

alter table public.project_members enable row level security;

drop policy if exists "Authenticated users can view project members" on public.project_members;
drop policy if exists "Admins can add project members" on public.project_members;
drop policy if exists "Admins can update project members" on public.project_members;
drop policy if exists "Admins can delete project members" on public.project_members;

create policy "Authenticated users can view project members"
  on public.project_members for select
  to authenticated
  using (true);

create policy "Admins can add project members"
  on public.project_members for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update project members"
  on public.project_members for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete project members"
  on public.project_members for delete
  to authenticated
  using (public.is_admin());

-- Auto-add the project creator as an admin member.
create or replace function public.handle_new_project_member()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.created_by, 'admin')
  on conflict (project_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_project_created on public.projects;
create trigger on_project_created
  after insert on public.projects
  for each row execute function public.handle_new_project_member();
