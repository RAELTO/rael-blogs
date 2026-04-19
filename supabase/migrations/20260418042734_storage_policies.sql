-- ============================================================
-- Storage: post-images bucket + access policies
-- ============================================================

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict do nothing;

create policy "storage_select_public" on storage.objects for select
  using (bucket_id = 'post-images');

create policy "storage_insert_own" on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_update_own" on storage.objects for update
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_delete_own" on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
