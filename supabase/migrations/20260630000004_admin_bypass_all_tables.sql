-- Admin bypass policies for ALL public tables that were missing them
-- labels: no admin policies existed
do $$ begin create policy "Admins can insert labels" on public.labels for insert to authenticated with check (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can select labels" on public.labels for select to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can update labels" on public.labels for update to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can delete labels" on public.labels for delete to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;

-- task_labels: no admin policies existed
do $$ begin create policy "Admins can insert task_labels" on public.task_labels for insert to authenticated with check (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can select task_labels" on public.task_labels for select to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can update task_labels" on public.task_labels for update to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can delete task_labels" on public.task_labels for delete to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;

-- task_dependencies: no admin policies existed
do $$ begin create policy "Admins can insert task_deps" on public.task_dependencies for insert to authenticated with check (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can select task_deps" on public.task_dependencies for select to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can update task_deps" on public.task_dependencies for update to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can delete task_deps" on public.task_dependencies for delete to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;

-- notifications: no admin policies existed
do $$ begin create policy "Admins can select notifications" on public.notifications for select to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can insert notifications" on public.notifications for insert to authenticated with check (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can update notifications" on public.notifications for update to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can delete notifications" on public.notifications for delete to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;

-- profiles: no admin UPDATE/DELETE existed
do $$ begin create policy "Admins can update profiles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "Admins can delete profiles" on public.profiles for delete to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;

-- email_change_requests: missing admin SELECT
do $$ begin create policy "Admins can select email changes" on public.email_change_requests for select to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;

-- join_requests: missing admin INSERT
do $$ begin create policy "Admins can insert join_requests" on public.join_requests for insert to authenticated with check (public.is_admin()); exception when duplicate_object then null; end $$;

-- project_members: missing admin SELECT
do $$ begin create policy "Admins can select project_members" on public.project_members for select to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;

-- projects: missing admin SELECT
do $$ begin create policy "Admins can select projects" on public.projects for select to authenticated using (public.is_admin()); exception when duplicate_object then null; end $$;
