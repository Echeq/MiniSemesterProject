-- Only admins can create tasks and projects

drop policy if exists "Authenticated users can create tasks as themselves" on public.tasks;

drop policy if exists "Members can create projects" on public.projects;
create policy "Admins can create projects"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());
