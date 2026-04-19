-- ============================================================
-- Add cover_type column to posts (gif | video | image | code)
-- ============================================================

alter table public.posts
  add column if not exists cover_type text not null default 'gif';
