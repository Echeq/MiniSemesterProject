-- Reconcile task/project RBAC so it matches the intended behaviour:
--
--   * Admins  : full CRUD on projects and tasks (create / edit / delete).
--   * Members : may VIEW tasks in projects they belong to and may only
--               MOVE them (drag-and-drop = change status / position).
--               No create, edit, or delete.
--
-- This migration is idempotent and safe to re-run. It also fixes two drifts
-- that defeated admin editing on the live database:
--   1. The `priority` column was added to the live DB out-of-band and was
--      never part of a migration, and crucially was missing from the
--      column-level UPDATE grant -- so every edit (which sends `priority`)
--      failed with "permission denied for column priority", surfacing as a
--      generic backend/RLS error.
--   2. Earlier migrations left tasks with only admin-only SELECT/UPDATE
--      policies, so members saw an empty board and could not drag cards.

-- ============================================================
-- 1. priority column + complete column-level UPDATE grant
-- ============================================================
alter table public.tasks add column if not exists priority text;

-- Re-state the column grant so it includes priority. created_by and the
-- timestamps stay ungranted (immutable). Members are further limited to
-- status/position by the trigger below.
revoke update on table public.tasks from authenticated;
grant update (title, description, status, due_date, position, assignee, project_id, priority)
  on table public.tasks to authenticated;

-- ============================================================
-- 2. Tasks RLS -- drop every legacy/partial policy first so none are OR'd in
-- ============================================================
drop policy if exists "Authenticated users can view tasks" on public.tasks;
drop policy if exists "Authenticated users can create tasks as themselves" on public.tasks;
drop policy if exists "Authenticated users can update tasks" on public.tasks;
drop policy if exists "Authenticated users can delete tasks" on public.tasks;
drop policy if exists "Admins can read all tasks" on public.tasks;
drop policy if exists "Admins can insert tasks" on public.tasks;
drop policy if exists "Admins can update tasks" on public.tasks;
drop policy if exists "Admins can delete tasks" on public.tasks;
drop policy if exists "Tasks are visible to admins and project members" on public.tasks;
drop policy if exists "Admins and members can move tasks" on public.tasks;

-- SELECT: admins see all; members see tasks on the shared board (no project)
-- or in projects they belong to.
create policy "Tasks are visible to admins and project members"
  on public.tasks for select
  to authenticated
  using (
    public.is_admin()
    or project_id is null
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id
        and pm.user_id = (select auth.uid())
    )
  );

-- INSERT: admins only, and only as themselves.
create policy "Admins can insert tasks"
  on public.tasks for insert
  to authenticated
  with check (public.is_admin() and created_by = (select auth.uid()));

-- UPDATE: admins anywhere; members only on tasks they can see. The column
-- trigger restricts members to status/position (drag-and-drop).
create policy "Admins and members can move tasks"
  on public.tasks for update
  to authenticated
  using (
    public.is_admin()
    or project_id is null
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id
        and pm.user_id = (select auth.uid())
    )
  )
  with check (
    public.is_admin()
    or project_id is null
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id
        and pm.user_id = (select auth.uid())
    )
  );

-- DELETE: admins only.
create policy "Admins can delete tasks"
  on public.tasks for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- 3. Restrict members to drag-and-drop: status + position only
-- ============================================================
create or replace function public.enforce_member_task_edit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Admins may change anything.
  if public.is_admin() then
    return new;
  end if;

  -- Non-admins may only reorder / move cards (drag-and-drop).
  if new.title       is distinct from old.title
     or new.description is distinct from old.description
     or new.due_date    is distinct from old.due_date
     or new.priority    is distinct from old.priority
     or new.assignee    is distinct from old.assignee
     or new.project_id  is distinct from old.project_id
     or new.created_by  is distinct from old.created_by then
    raise exception 'Members can only move tasks (drag-and-drop), not edit their details'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_member_task_edit on public.tasks;
create trigger enforce_member_task_edit
  before update on public.tasks
  for each row execute function public.enforce_member_task_edit();

-- ============================================================
-- 4. Projects RLS -- only admins may create / edit / delete
-- ============================================================
drop policy if exists "Members can create projects" on public.projects;
drop policy if exists "Admins can create projects" on public.projects;
create policy "Admins can create projects"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Creators and admins can update projects" on public.projects;
drop policy if exists "Members can update projects" on public.projects;
drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
  on public.projects for delete
  to authenticated
  using (public.is_admin());
