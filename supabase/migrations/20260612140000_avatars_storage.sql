-- Avatars storage bucket for profile pictures
-- Public bucket so images are accessible without auth tokens.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own avatar
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own avatar
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (bucket is public)
create policy "Anyone can view avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Allow users to delete their own avatar
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
