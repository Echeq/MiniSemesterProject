-- TaskFlow: account management
-- - Avatar storage bucket + RLS (upload / change / delete own avatar).
-- - Self-service account deletion (delete_own_account RPC).
-- Note: changing password and logging out are handled client-side by
-- Supabase Auth (supabase.auth.updateUser / signOut) — no SQL required.
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

-- ============================================================
-- 1. Avatar storage bucket (public-read)
--    Files are stored under "<user-id>/<filename>" so a user can only
--    write within their own folder. avatar_url on profiles points here.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can replace their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================
-- 2. Delete own account
--    Removing the auth.users row requires elevated rights, so this is a
--    SECURITY DEFINER RPC. profiles (and its cascades: tasks, projects,
--    invitations) are removed via "on delete cascade".
--    The frontend confirmation modal calls supabase.rpc('delete_own_account').
-- ============================================================
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public, auth
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  -- Don't let the team lose its only admin.
  if public.is_admin()
     and (select count(*) from public.profiles where role = 'admin') = 1 then
    raise exception 'Cannot delete the last admin account. Assign another admin first.'
      using errcode = 'P0001';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
