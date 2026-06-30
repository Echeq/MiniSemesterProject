-- Allow members to insert, update, and delete tasks (previously admin-only for
-- insert/delete; update was restricted to own assigned tasks).

-- Drop the old restrictive member update policy
drop policy if exists "Members can update own tasks" on public.tasks;

-- Members can update any task (not just own assigned)
do $$ begin
  create policy "Members can update tasks"
    on public.tasks for update
    to authenticated
    using (
      not is_admin()
      and (select role from public.profiles where id = auth.uid()) = 'member'
    )
    with check (
      not is_admin()
      and (select role from public.profiles where id = auth.uid()) = 'member'
    );
exception when duplicate_object then null;
end $$;

-- Members can insert tasks (like admins, with created_by = self)
do $$ begin
  create policy "Members can insert tasks"
    on public.tasks for insert
    to authenticated
    with check (
      not is_admin()
      and (select role from public.profiles where id = auth.uid()) = 'member'
      and created_by = auth.uid()
    );
exception when duplicate_object then null;
end $$;

-- Members can delete tasks
do $$ begin
  create policy "Members can delete tasks"
    on public.tasks for delete
    to authenticated
    using (
      not is_admin()
      and (select role from public.profiles where id = auth.uid()) = 'member'
    );
exception when duplicate_object then null;
end $$;
