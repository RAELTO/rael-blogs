-- ============================================================
-- Add role and is_banned columns to profiles
-- ============================================================

alter table public.profiles
  add column if not exists role      text not null default 'user',
  add column if not exists is_banned boolean not null default false;
