-- Fix RLS policies: drop permissive old policies that were never cleaned up.
-- Migration 20260617120000 attempted DROP POLICY IF EXISTS but the old policies
-- persisted in the live DB, allowing ANY authenticated user full CRUD on ALL tasks.

-- Drop permissive old policies
drop policy if exists "Authenticated users can view tasks" on public.tasks;
drop policy if exists "Authenticated users can update tasks" on public.tasks;
drop policy if exists "Authenticated users can delete tasks" on public.tasks;

-- Admin policies for tasks
do $$ begin
  create policy "Admins can insert tasks"
    on public.tasks for insert
    to authenticated
    with check (public.is_admin() and created_by = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update tasks"
    on public.tasks for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete tasks"
    on public.tasks for delete
    to authenticated
    using (public.is_admin());
exception when duplicate_object then null;
end $$;

-- Revoke EXECUTE FROM anon on all SECURITY DEFINER RPCs
revoke execute on function public.admin_set_role(uuid, public.app_role) from anon;
revoke execute on function public.set_project_status(uuid, public.project_status) from anon;
revoke execute on function public.delete_own_account() from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.restore_from_backup(jsonb) from anon;
revoke execute on function public.log_activity(text, text, uuid, jsonb) from anon;
revoke execute on function public.get_logs(uuid, text, timestamp with time zone, timestamp with time zone) from anon;
revoke execute on function public.get_profile_preferences(uuid) from anon;
revoke execute on function public.set_profile_preferences(uuid, jsonb) from anon;
revoke execute on function public.check_blocked_tasks(uuid) from anon;
revoke execute on function public.add_task_dependency(uuid, uuid) from anon;
revoke execute on function public.export_all_data() from anon;
revoke execute on function public.get_filtered_tasks(text, text, uuid, date, date, uuid[], text, text) from anon;
revoke execute on function public.get_notifications(uuid) from anon;
