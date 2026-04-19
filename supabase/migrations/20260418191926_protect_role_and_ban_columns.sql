-- ============================================================
-- Protect role and is_banned from self-modification
-- Replace the base profiles_update_own policy with one that
-- prevents users from elevating their own role or unbanning themselves.
-- Also add admin policy to update role/ban on any profile.
-- ============================================================

drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role     = (select p.role      from public.profiles p where p.id = auth.uid())
    and is_banned = (select p.is_banned from public.profiles p where p.id = auth.uid())
  );

create policy "admin_ban_users" on public.profiles for update
  using  (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
