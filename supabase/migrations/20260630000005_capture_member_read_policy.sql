-- Capture the "Members can read accessible tasks" policy applied by MCP
-- that was missing from migration files (DB drift).
-- Allows members to read tasks assigned to them, in shared board, or in projects they belong to.

do $$ begin
  create policy "Members can read accessible tasks"
    on public.tasks for select
    to authenticated
    using (
      not is_admin()
      and (select role from public.profiles where id = auth.uid()) = 'member'
      and (
        assignee = auth.uid()
        or project_id is null
        or exists (
          select 1 from public.project_members
          where project_members.project_id = tasks.project_id
            and project_members.user_id = auth.uid()
        )
      )
    );
exception when duplicate_object then null;
end $$;
