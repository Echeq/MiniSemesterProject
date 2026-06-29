-- Change projects RLS: members only see projects they belong to.
-- Admins still see all. Add RPCs for member management.

drop policy if exists "Authenticated users can view projects" on public.projects;

create policy "Members can view own projects"
  on public.projects for select
  to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.project_members
      where project_members.project_id = projects.id
        and project_members.user_id = auth.uid()
    )
  );

-- Add member to project (admin only)
create or replace function public.add_project_member(
  p_project_id uuid,
  p_user_id uuid,
  p_role text default 'member'
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can add project members';
  end if;
  insert into public.project_members (project_id, user_id, role)
  values (p_project_id, p_user_id, p_role)
  on conflict (project_id, user_id) do nothing;
end;
$$;

revoke all on function public.add_project_member(uuid, uuid, text) from public;
grant execute on function public.add_project_member(uuid, uuid, text) to authenticated;
revoke execute on function public.add_project_member(uuid, uuid, text) from anon;

-- Remove member from project (admin or project admin only)
create or replace function public.remove_project_member(
  p_project_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  caller_role text;
begin
  select role into caller_role
  from public.project_members
  where project_id = p_project_id and user_id = auth.uid();

  if not public.is_admin() and (caller_role is null or caller_role != 'admin') then
    raise exception 'Only admins or project admins can remove members';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot remove yourself from a project';
  end if;

  delete from public.project_members
  where project_id = p_project_id and user_id = p_user_id;
end;
$$;

revoke all on function public.remove_project_member(uuid, uuid) from public;
grant execute on function public.remove_project_member(uuid, uuid) to authenticated;
revoke execute on function public.remove_project_member(uuid, uuid) from anon;
