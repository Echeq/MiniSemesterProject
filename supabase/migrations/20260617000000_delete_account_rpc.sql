-- delete_account: allows authenticated users to delete their own auth record.
-- security definer bypasses auth schema restrictions; auth.uid() ensures
-- users can only delete themselves. Cascading FK deletes clean up profile,
-- tasks, invitations, and join_requests.

create or replace function public.delete_account()
returns void
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
