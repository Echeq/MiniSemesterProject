-- Email change request system: users submit, admins approve/reject
create table if not exists public.email_change_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  old_email   text not null,
  new_email   text not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz
);

alter table public.email_change_requests enable row level security;

do $$ begin
  create policy "Users can view own requests"
    on public.email_change_requests for select
    to authenticated
    using (user_id = auth.uid() or public.is_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert own requests"
    on public.email_change_requests for insert
    to authenticated
    with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update requests"
    on public.email_change_requests for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
exception when duplicate_object then null;
end $$;

-- Submit an email change request
create or replace function public.submit_email_change(new_email text)
returns uuid
language plpgsql
security definer
as $$
declare
  req_id uuid;
begin
  insert into public.email_change_requests (user_id, old_email, new_email, status)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), new_email, 'pending')
  returning id into req_id;
  return req_id;
end;
$$;

-- Admin approves: updates auth.users.email directly
create or replace function public.approve_email_change(request_id uuid)
returns void
language plpgsql
security definer
set search_path = auth
as $$
declare
  rec record;
begin
  if not public.is_admin() then
    raise exception 'Only admins can approve email changes' using errcode = '42501';
  end if;

  select * into rec from public.email_change_requests where id = request_id and status = 'pending';
  if not found then
    raise exception 'Request not found or already processed' using errcode = 'P0002';
  end if;

  update auth.users set email = rec.new_email, updated_at = now() where id = rec.user_id;

  update public.email_change_requests
  set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  where id = request_id;
end;
$$;

-- Admin rejects
create or replace function public.reject_email_change(request_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can reject email changes' using errcode = '42501';
  end if;

  update public.email_change_requests
  set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
  where id = request_id and status = 'pending';

  if not found then
    raise exception 'Request not found or already processed' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.submit_email_change(text) from anon, public;
grant execute on function public.submit_email_change(text) to authenticated;
revoke execute on function public.approve_email_change(uuid) from anon, public;
grant execute on function public.approve_email_change(uuid) to authenticated;
revoke execute on function public.reject_email_change(uuid) from anon, public;
grant execute on function public.reject_email_change(uuid) to authenticated;
