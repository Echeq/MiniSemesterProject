-- Admins need a SELECT policy on tasks to read rows they insert.
-- This was supposed to be created by 20260617120000 but was never
-- applied to the live DB. Dropping the old permissive SELECT policy
-- in 20260629000002 broke admin task creation.

do $$ begin
  create policy "Admins can read all tasks"
    on public.tasks for select
    to authenticated
    using (public.is_admin());
exception when duplicate_object then null;
end $$;
