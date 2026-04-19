-- ============================================================
-- Admin can insert/delete post_categories and post_tags
-- regardless of post authorship (needed for editing others' posts)
-- ============================================================

create policy "post_categories_insert_admin" on public.post_categories
  for insert to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "post_categories_delete_admin" on public.post_categories
  for delete to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "post_tags_insert_admin" on public.post_tags
  for insert to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "post_tags_delete_admin" on public.post_tags
  for delete to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
