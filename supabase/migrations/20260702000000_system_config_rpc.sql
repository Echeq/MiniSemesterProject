-- 1. RPC to get all system config as JSON object
create or replace function public.get_system_config()
returns jsonb
language plpgsql
security definer
as $$
begin
  return coalesce(
    jsonb_object_agg(key, value),
    '{}'::jsonb
  )
  from public.system_config;
end;
$$;

grant execute on function public.get_system_config() to authenticated;

-- 2. RPC to set a single config key-value
create or replace function public.set_system_config(
  p_key   text,
  p_value jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.system_config (key, value)
  values (p_key, p_value)
  on conflict (key)
  do update set
    value      = excluded.value,
    updated_at = now();
end;
$$;

grant execute on function public.set_system_config(text, jsonb) to authenticated;

-- 3. RPC to delete a system config key
create or replace function public.delete_system_config(p_key text)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.system_config where key = p_key;
end;
$$;

grant execute on function public.delete_system_config(text) to authenticated;
