-- ============================================================
-- Allow authenticated users to create tags
-- ============================================================

create policy "tags_insert_authenticated" on public.tags
  for insert to authenticated
  with check (true);
