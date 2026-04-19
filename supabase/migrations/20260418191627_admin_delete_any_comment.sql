-- ============================================================
-- Admin can delete any comment
-- ============================================================

create policy "admin_delete_any_comment" on public.comments for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
