-- Capture RPCs, triggers, and tables added via Supabase MCP
-- but missing from supabase/migrations/. Extracted from live DB on 2026-06-27.

-- ============================================================
-- 1. notifications table (referenced by notify_due_soon trigger
--    from 20260625000005 but table was created via MCP)
-- ============================================================
create table if not exists public.notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles (id) on delete cascade,
  type      text not null check (type = any (array['due_soon', 'overdue', 'assignment', 'mention'])),
  message   text not null check (char_length(message) between 1 and 500),
  task_id   uuid references public.tasks (id) on delete cascade,
  read      boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists notifications_user_read_idx on public.notifications (user_id, read);

alter table public.notifications enable row level security;

do $$ begin
  create policy "Users can view their own notifications"
    on public.notifications for select
    to authenticated
    using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own notifications"
    on public.notifications for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

-- Trigger for notify_due_soon (function exists from 20260625000005)
do $$ begin
  create trigger on_task_due_notification
    after insert or update of due_date, status on public.tasks
    for each row execute function public.notify_due_soon();
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 2. Circular-dependency guard on task_dependencies
-- ============================================================
create or replace function public.check_circular_dependency()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  current_id uuid;
begin
  current_id := new.depends_on_id;
  loop
    if current_id = new.task_id then
      raise exception 'Circular dependency detected' using errcode = 'P0001';
    end if;
    select depends_on_id into current_id
    from public.task_dependencies
    where task_id = current_id;
    exit when current_id is null;
  end loop;
  return new;
end;
$$;

do $$ begin
  create trigger on_task_dependency_insert
    before insert on public.task_dependencies
    for each row execute function public.check_circular_dependency();
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 3. RPC: add_task_dependency
-- ============================================================
create or replace function public.add_task_dependency(p_task_id uuid, p_depends_on_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_task_id = p_depends_on_id then
    raise exception 'A task cannot depend on itself' using errcode = 'P0001';
  end if;
  insert into public.task_dependencies (task_id, depends_on_id)
  values (p_task_id, p_depends_on_id);
end;
$$;

-- ============================================================
-- 4. RPC: check_blocked_tasks — returns incomplete dependencies
-- ============================================================
create or replace function public.check_blocked_tasks(target_task_id uuid)
returns table(depends_on_id uuid, title text, status text, priority text)
language sql
stable security definer set search_path = public
as $$
  select td.depends_on_id, t.title, t.status, t.priority
  from public.task_dependencies td
  join public.tasks t on t.id = td.depends_on_id
  where td.task_id = target_task_id and t.status != 'done'
  order by t."position";
$$;

-- ============================================================
-- 5. RPC: export_all_data — full user-scoped export
-- ============================================================
create or replace function public.export_all_data()
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'projects', coalesce((select jsonb_agg(to_jsonb(p)) from public.projects p where p.created_by = auth.uid() or exists (select 1 from public.project_members pm where pm.project_id = p.id and pm.user_id = auth.uid())), '[]'::jsonb),
    'tasks', coalesce((select jsonb_agg(to_jsonb(t)) from public.tasks t where t.created_by = auth.uid() or t.assignee = auth.uid() or exists (select 1 from public.project_members pm where pm.project_id = t.project_id and pm.user_id = auth.uid())), '[]'::jsonb),
    'labels', coalesce((select jsonb_agg(to_jsonb(l)) from public.labels l where exists (select 1 from public.project_members pm where pm.project_id = l.project_id and pm.user_id = auth.uid())), '[]'::jsonb),
    'members', coalesce((select jsonb_agg(to_jsonb(pr)) from public.profiles pr where exists (select 1 from public.project_members pm where pm.user_id = pr.id and exists (select 1 from public.project_members pm2 where pm2.user_id = auth.uid() and pm2.project_id = pm.project_id))), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

-- ============================================================
-- 6. RPC: get_filtered_tasks — server-side filtered query
-- ============================================================
create or replace function public.get_filtered_tasks(
  p_status text default null,
  p_priority text default null,
  p_assignee uuid default null,
  p_date_from date default null,
  p_date_to date default null,
  p_label_ids uuid[] default null,
  p_order_by text default 'position',
  p_order_dir text default 'asc'
)
returns table(
  id uuid, title text, description text, status text, priority text,
  due_date date, "position" double precision, created_by uuid, assignee uuid,
  project_id uuid, created_at timestamptz, updated_at timestamptz,
  assignee_display_name text, assignee_avatar_url text
)
language plpgsql
stable security definer set search_path = public
as $$
declare
  q text;
begin
  q := '
    select t.id, t.title, t.description, t.status::text, t.priority,
           t.due_date, t."position", t.created_by, t.assignee,
           t.project_id, t.created_at, t.updated_at,
           p.display_name as assignee_display_name, p.avatar_url as assignee_avatar_url
    from public.tasks t
    left join public.profiles p on p.id = t.assignee
    where (public.is_admin() or t.assignee = auth.uid() or exists (
      select 1 from public.project_members pm
      where pm.project_id = t.project_id and pm.user_id = auth.uid()
    ))';

  if p_status is not null then
    q := q || ' and t.status = ' || quote_literal(p_status);
  end if;
  if p_priority is not null then
    q := q || ' and t.priority = ' || quote_literal(p_priority);
  end if;
  if p_assignee is not null then
    q := q || ' and t.assignee = ' || quote_literal(p_assignee);
  end if;
  if p_date_from is not null then
    q := q || ' and t.due_date >= ' || quote_literal(p_date_from);
  end if;
  if p_date_to is not null then
    q := q || ' and t.due_date <= ' || quote_literal(p_date_to);
  end if;
  if p_label_ids is not null and array_length(p_label_ids, 1) > 0 then
    q := q || ' and t.id in (select task_id from public.task_labels where label_id = any(' || quote_literal(p_label_ids) || '))';
  end if;

  q := q || ' order by ' || quote_ident(p_order_by) || ' ' || case when p_order_dir = 'desc' then 'desc' else 'asc' end;

  return query execute q;
end;
$$;

-- ============================================================
-- 7. RPC: get_notifications — unread notifications for a user
-- ============================================================
create or replace function public.get_notifications(target_user_id uuid)
returns table(id uuid, type text, message text, task_id uuid, read boolean, created_at timestamptz, task_title text, task_status text)
language sql
stable security definer set search_path = public
as $$
  select n.id, n.type, n.message, n.task_id, n.read, n.created_at,
         t.title, t.status
  from public.notifications n
  left join public.tasks t on t.id = n.task_id
  where n.user_id = target_user_id and n.read = false
  order by n.created_at desc;
$$;

-- ============================================================
-- 8. RPC: log_activity — audit trail
-- ============================================================
create or replace function public.log_activity(
  p_action text,
  p_target_type text,
  p_target_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer set search_path = public
as $$
  insert into public.system_logs (user_id, action, target_type, target_id, metadata)
  values (auth.uid(), p_action, p_target_type, p_target_id, p_metadata);
$$;
