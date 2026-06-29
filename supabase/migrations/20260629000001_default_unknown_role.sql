-- Default new users to 'unknown' role instead of 'member'
-- An 'unknown' user sees an empty board (RLS falls through — no tasks).
-- They can submit a join request from the UI.

alter type public.app_role add value if not exists 'unknown' after 'member';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  invited_role public.app_role;
begin
  -- Role from a matching pending invitation, if any.
  select role into invited_role
  from public.invitations
  where lower(email) = lower(new.email) and status = 'pending'
  limit 1;

  -- Bootstrap: the very first account is always an admin.
  if not exists (select 1 from public.profiles where role = 'admin') then
    invited_role := 'admin';
  end if;

  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    left(
      coalesce(
        nullif(new.raw_user_meta_data ->> 'display_name', ''),
        split_part(new.email, '@', 1)
      ),
      100
    ),
    coalesce(invited_role, 'unknown')
  );

  -- Consume the invitation.
  update public.invitations
  set status = 'accepted', accepted_at = now()
  where lower(email) = lower(new.email) and status = 'pending';

  return new;
end;
$$;
