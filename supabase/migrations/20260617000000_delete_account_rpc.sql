-- delete_account: allows authenticated users to delete their own auth record.
-- security definer bypasses auth schema restrictions; auth.uid() ensures
-- users can only delete themselves. Cascading FK deletes clean up profile,
-- tasks, invitations, and join_requests.

create or replace function public.delete_account()
returns void
language plpgsql
security definer set search_path = public, auth
as $$
begin
  -- Backwards-compatible wrapper:
  -- Enforce the same "last admin" guard as delete_own_account().
  perform public.delete_own_account();
end;
$$;
