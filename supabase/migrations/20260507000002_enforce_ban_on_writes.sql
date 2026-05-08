-- ============================================================
-- Enforce is_banned at DB level for all write operations.
-- Previously, is_banned was only checked in the UI.
-- ============================================================

-- Helper: returns true if the current user is banned
create or replace function public.is_banned()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select is_banned from public.profiles where id = auth.uid()),
    false
  );
$$;

-- posts: banned users cannot create or edit posts
drop policy if exists "posts_insert_own" on public.posts;
drop policy if exists "posts_update_own" on public.posts;

create policy "posts_insert_own" on public.posts for insert
  with check (auth.uid() = author_id and not public.is_banned());

create policy "posts_update_own" on public.posts for update
  using (auth.uid() = author_id and not public.is_banned());

-- comments: banned users cannot comment
drop policy if exists "Authenticated users can comment" on public.comments;

create policy "Authenticated users can comment" on public.comments for insert
  with check (auth.uid() = author_id and not public.is_banned());

-- post_likes: banned users cannot like
drop policy if exists "Authenticated users can like" on public.post_likes;

create policy "Authenticated users can like" on public.post_likes for insert
  with check (auth.uid() = user_id and not public.is_banned());

-- post_bookmarks: banned users cannot bookmark
drop policy if exists "Users can bookmark" on public.post_bookmarks;

create policy "Users can bookmark" on public.post_bookmarks for insert
  with check (auth.uid() = user_id and not public.is_banned());

-- tags: banned users cannot create tags
drop policy if exists "tags_insert_authenticated" on public.tags;

create policy "tags_insert_authenticated" on public.tags
  for insert to authenticated
  with check (not public.is_banned());
