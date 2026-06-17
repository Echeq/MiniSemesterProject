-- Role system: add admin/member/unknown roles to profiles,
-- create invitations table for email-based access control,
-- update RLS policies for role-based task visibility.

-- ============================================================
-- 1. Add role column to profiles
-- ============================================================
alter table public.profiles
  add column role text not null default 'unknown'
  check (role in ('admin', 'member', 'unknown'));

comment on column public.profiles.role is 'admin | member | unknown — controls task visibility and edit permissions';

-- ============================================================
-- 2. Invitations — admin invites members by email
-- ============================================================
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete cascade,
  invited_email text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (invited_email)
);

create index idx_invitations_admin on public.invitations (admin_id);

comment on table public.invitations is 'Email-based invitations. When a user signs up with a matching email, handle_new_user sets role = member.';

-- ============================================================
-- 3. Join requests — unknown users requesting access
-- ============================================================
create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  admin_email text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now()
);

create index idx_join_requests_requester on public.join_requests (requester_id);

comment on table public.join_requests is 'Access requests from unknown users. Admins can review and invite them.';

-- ============================================================
-- 4. RLS policies for invitations
-- ============================================================
alter table public.invitations enable row level security;

create policy "Admins can create invitations"
  on public.invitations for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can view all invitations"
  on public.invitations for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can check own invitation by email"
  on public.invitations for select
  to authenticated
  using (invited_email = auth.email()::text);

create policy "Admins can update invitations"
  on public.invitations for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- 5. RLS policies for join_requests
-- ============================================================
alter table public.join_requests enable row level security;

create policy "Users can create own join request"
  on public.join_requests for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "Users can view own join requests"
  on public.join_requests for select
  to authenticated
  using (requester_id = auth.uid());

create policy "Admins can view all join requests"
  on public.join_requests for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update join requests"
  on public.join_requests for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- 6. Update handle_new_user trigger
--    - First user ever → admin
--    - Pending invitation found → member
--    - Otherwise → unknown
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
  v_invitation_id uuid;
  v_user_count int;
begin
  select count(*) into v_user_count from public.profiles;

  if v_user_count = 0 then
    v_role := 'admin';
  else
    select id into v_invitation_id
    from public.invitations
    where invited_email = new.email
      and status = 'pending'
    limit 1;

    if v_invitation_id is not null then
      v_role := 'member';
      update public.invitations set status = 'accepted' where id = v_invitation_id;
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

-- ============================================================
-- 7. Update task RLS policies for role-based access
--    Admins: full CRUD on all tasks
--    Members: read-only, only tasks assigned to them
--    Unknown: no task access (RLS returns empty)
-- ============================================================
drop policy if exists "Authenticated users can view tasks" on public.tasks;
drop policy if exists "Authenticated users can create tasks as themselves" on public.tasks;
drop policy if exists "Authenticated users can update tasks" on public.tasks;
drop policy if exists "Authenticated users can delete tasks" on public.tasks;

create policy "Admins can read all tasks"
  on public.tasks for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Members can read assigned tasks"
  on public.tasks for select
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'member')
    and assignee = auth.uid()
  );

create policy "Admins can insert tasks"
  on public.tasks for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    and created_by = auth.uid()
  );

create policy "Admins can update tasks"
  on public.tasks for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can delete tasks"
  on public.tasks for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- 8. Update profile update policy — prevent self role-elevation
-- ============================================================
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile (except role)"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (true);
