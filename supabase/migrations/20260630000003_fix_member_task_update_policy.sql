-- Members can update tasks assigned to them
do $$ begin
  create policy "Members can update own tasks"
    on public.tasks for update
    to authenticated
    using (
      not is_admin()
      and (select role from public.profiles where id = auth.uid()) = 'member'
      and assignee = auth.uid()
    )
    with check (
      not is_admin()
      and (select role from public.profiles where id = auth.uid()) = 'member'
      and assignee = auth.uid()
    );
exception when duplicate_object then null;
end $$;
