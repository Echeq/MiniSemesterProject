-- TaskFlow: get_logs RPC, profile preferences column, get/set preference RPCs

-- 1. RPC: get filtered logs
create or replace function public.get_logs(
  p_user_id uuid default null,
  p_action text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null
)
returns table (
  id uuid, user_id uuid, action text, target_type text, target_id uuid,
  metadata jsonb, created_at timestamptz,
  user_display_name text, user_avatar_url text
)
language plpgsql
stable
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can view logs' using errcode = '42501';
  end if;

  return query
    select sl.id, sl.user_id, sl.action, sl.target_type, sl.target_id,
           sl.metadata, sl.created_at,
           p.display_name, p.avatar_url
    from public.system_logs sl
    left join public.profiles p on p.id = sl.user_id
    where (p_user_id is null or sl.user_id = p_user_id)
      and (p_action is null or sl.action = p_action)
      and (p_date_from is null or sl.created_at >= p_date_from)
      and (p_date_to is null or sl.created_at <= p_date_to)
    order by sl.created_at desc;
end;
$$;

revoke all on function public.get_logs(uuid, text, timestamptz, timestamptz) from public;
grant execute on function public.get_logs(uuid, text, timestamptz, timestamptz) to authenticated;

-- 2. Preferences column on profiles
alter table public.profiles
  add column if not exists preferences jsonb default '{}'::jsonb;

comment on column public.profiles.preferences is
  'User UI preferences stored as JSON: {column_visibility, filters, sort, etc.}';

grant update (preferences) on table public.profiles to authenticated;

-- 3. RPC: get profile preferences
create or replace function public.get_profile_preferences(target_user_id uuid)
returns jsonb
language sql
stable
security definer set search_path = public
as $$
  select coalesce(preferences, '{}'::jsonb)
  from public.profiles
  where id = target_user_id;
$$;

revoke all on function public.get_profile_preferences(uuid) from public;
grant execute on function public.get_profile_preferences(uuid) to authenticated;

-- 4. RPC: set profile preferences
create or replace function public.set_profile_preferences(
  target_user_id uuid,
  prefs jsonb
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if target_user_id <> auth.uid() and not public.is_admin() then
    raise exception 'Cannot modify another user preferences' using errcode = '42501';
  end if;

  update public.profiles
  set preferences = prefs
  where id = target_user_id;
end;
$$;

revoke all on function public.set_profile_preferences(uuid, jsonb) from public;
grant execute on function public.set_profile_preferences(uuid, jsonb) to authenticated;
