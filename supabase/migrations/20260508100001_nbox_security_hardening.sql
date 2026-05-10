-- ============================================================
-- NBOX Security Hardening
-- - FK performance indexes
-- - Storage: restrict object listing to owner only
-- - search_boxes: grant only to authenticated
-- ============================================================

-- ---- 1. Performance indexes on FK columns ----
create index if not exists idx_boxes_author_id
  on public.boxes(author_id);

create index if not exists idx_boxes_published_at
  on public.boxes(published_at desc)
  where status = 'published';

create index if not exists idx_box_comments_box_id
  on public.box_comments(box_id);

create index if not exists idx_box_comments_author_id
  on public.box_comments(author_id);

create index if not exists idx_box_reactions_box_id
  on public.box_reactions(box_id);

create index if not exists idx_box_reactions_user_id
  on public.box_reactions(user_id);

create index if not exists idx_box_votes_box_id
  on public.box_votes(box_id);

create index if not exists idx_box_votes_user_id
  on public.box_votes(user_id);

create index if not exists idx_box_shares_box_id
  on public.box_shares(box_id);

create index if not exists idx_comment_votes_comment_id
  on public.comment_votes(comment_id);

create index if not exists idx_comment_reactions_comment_id
  on public.comment_reactions(comment_id);

create index if not exists idx_follows_following_id
  on public.follows(following_id);

create index if not exists idx_follows_follower_id
  on public.follows(follower_id);

-- ---- 2. Storage: restrict object listing ----
-- The SELECT policy controls who can query storage.objects metadata (list files).
-- Public bucket URLs remain accessible to everyone regardless of this policy.
drop policy if exists "storage_select_public" on storage.objects;

create policy "storage_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---- 3. Restrict search_boxes to authenticated role ----
revoke execute on function public.search_boxes(text, integer) from anon;
grant  execute on function public.search_boxes(text, integer) to authenticated;
