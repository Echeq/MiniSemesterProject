-- Admin can delete any user account
create or replace function public.admin_delete_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can delete users' using errcode = '42501';
  end if;

  if target_user = auth.uid() then
    raise exception 'Admins cannot delete themselves' using errcode = '42501';
  end if;

  if (select count(*) from public.profiles where role = 'admin') = 1
     and (select role from public.profiles where id = target_user) = 'admin' then
    raise exception 'Cannot delete the last admin. Assign another admin first.' using errcode = 'P0001';
  end if;

  delete from auth.users where id = target_user;
end;
$$;

revoke execute on function public.admin_delete_user(uuid) from anon, public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
