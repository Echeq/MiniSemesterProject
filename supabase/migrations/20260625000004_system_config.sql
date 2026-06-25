-- TaskFlow: system_config table for app-wide key-value settings

create table if not exists public.system_config (
  key   text primary key check (char_length(key) between 1 and 100),
  value jsonb not null default 'null'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.system_config is 'App-wide configuration key-value store. Admins only.';

alter table public.system_config enable row level security;

create policy "Admins can read system config"
  on public.system_config for select to authenticated
  using (public.is_admin());

create policy "Admins can insert system config"
  on public.system_config for insert to authenticated
  with check (public.is_admin());

create policy "Admins can update system config"
  on public.system_config for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete system config"
  on public.system_config for delete to authenticated
  using (public.is_admin());

grant select, insert, update, delete on table public.system_config to authenticated;
