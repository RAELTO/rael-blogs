-- Presencia de usuarios: last_seen_at se actualiza cada 60s desde el cliente
alter table public.profiles
  add column if not exists last_seen_at timestamptz;

create index if not exists idx_profiles_last_seen_at
  on public.profiles(last_seen_at desc nulls last);
