-- More notification events + enable realtime delivery for the bell.
--
-- Existing: notify_due_soon() creates due_soon/overdue notifications.
-- This adds notifications for task assignment, role changes, and project
-- membership, and ensures the notifications table is in the realtime
-- publication so the in-app bell updates live.
-- Idempotent. Apply with `supabase db push` or via the Supabase SQL editor.

-- ============================================================
-- 1. Allow a generic 'system' notification type (team/dev events)
-- ============================================================
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type = any (array['due_soon', 'overdue', 'assignment', 'mention', 'system']));

-- ============================================================
-- 2. Notify the assignee when a task is assigned to them
-- ============================================================
create or replace function public.notify_on_assignment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.assignee is not null
     and (tg_op = 'INSERT' or new.assignee is distinct from old.assignee)
     and new.assignee is distinct from auth.uid() then        -- don't notify self-assignment
    insert into public.notifications (user_id, type, message, task_id)
    values (new.assignee, 'assignment', 'You were assigned to "' || new.title || '"', new.id);
  end if;
  return new;
end;
$$;

do $$ begin
  create trigger on_task_assignment
    after insert or update of assignee on public.tasks
    for each row execute function public.notify_on_assignment();
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 3. Notify a user when their app role changes (promote / demote)
-- ============================================================
create or replace function public.notify_on_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    insert into public.notifications (user_id, type, message, task_id)
    values (
      new.id,
      'system',
      case when new.role::text = 'admin'
        then 'You are now an admin'
        else 'Your role was changed to ' || new.role::text
      end,
      null
    );
  end if;
  return new;
end;
$$;

do $$ begin
  create trigger on_profile_role_change
    after update of role on public.profiles
    for each row execute function public.notify_on_role_change();
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 4. Notify a user when they are added to a project
-- ============================================================
create or replace function public.notify_on_membership()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  proj_name text;
begin
  if new.user_id is distinct from auth.uid() then            -- skip self-add (project creator)
    select name into proj_name from public.projects where id = new.project_id;
    insert into public.notifications (user_id, type, message, task_id)
    values (new.user_id, 'system', 'You were added to project "' || coalesce(proj_name, 'a project') || '"', null);
  end if;
  return new;
end;
$$;

do $$ begin
  create trigger on_project_membership
    after insert on public.project_members
    for each row execute function public.notify_on_membership();
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 5. Ensure the notifications table streams over realtime
-- ============================================================
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
