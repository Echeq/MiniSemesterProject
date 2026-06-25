-- TaskFlow: restore_from_backup RPC

create or replace function public.restore_from_backup(data jsonb)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can restore backups' using errcode = '42501';
  end if;

  insert into public.projects (id, name, description, status, color, icon, created_by, created_at, updated_at)
  select
    p->>'id', p->>'name',
    coalesce(p->>'description', ''),
    coalesce(p->>'status', 'active'),
    coalesce(p->>'color', '#6366f1'),
    coalesce(p->>'icon', 'project'),
    (p->>'created_by')::uuid,
    coalesce((p->>'created_at')::timestamptz, now()),
    now()
  from jsonb_array_elements(data->'projects') as p
  on conflict (id) do nothing;

  insert into public.tasks (id, title, description, status, priority, due_date, position, created_by, assignee, project_id, created_at, updated_at)
  select
    t->>'id', t->>'title',
    coalesce(t->>'description', ''),
    coalesce(t->>'status', 'todo'),
    t->>'priority',
    (t->>'due_date')::date,
    coalesce((t->>'position')::float8, 1024),
    (t->>'created_by')::uuid,
    (t->>'assignee')::uuid,
    (t->>'project_id')::uuid,
    coalesce((t->>'created_at')::timestamptz, now()),
    now()
  from jsonb_array_elements(data->'tasks') as t
  on conflict (id) do nothing;

  insert into public.labels (id, name, color, project_id, created_at)
  select
    l->>'id', l->>'name',
    coalesce(l->>'color', '#6366f1'),
    (l->>'project_id')::uuid,
    coalesce((l->>'created_at')::timestamptz, now())
  from jsonb_array_elements(data->'labels') as l
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.restore_from_backup(jsonb) from public;
grant execute on function public.restore_from_backup(jsonb) to authenticated;
