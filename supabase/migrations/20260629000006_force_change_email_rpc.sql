-- Force-change email for users whose current auth email has an invalid domain.
-- Bypasses GoTrue's email validation (which rejects changes from unconfirmed
-- or invalid-domain emails) by directly updating auth.users.
-- The caller must be authenticated; the RPC runs as SECURITY DEFINER.

create or replace function public.force_change_email(new_email text)
returns void
language plpgsql
security definer
set search_path = auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  update auth.users
  set email = new_email,
      email_change = '',
      email_change_token_current = '',
      email_change_token_new = '',
      email_change_sent_at = null,
      updated_at = now()
  where id = auth.uid();

  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
end;
$$;

-- Revoke from anon, grant to authenticated
revoke execute on function public.force_change_email(text) from anon, public;
grant execute on function public.force_change_email(text) to authenticated;
