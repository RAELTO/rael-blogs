-- ============================================================
-- Admin bypass: allow admins to update and delete any post
-- ============================================================

create policy "admin_delete_any_post" on public.posts for delete
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create policy "admin_update_any_post" on public.posts for update
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));
