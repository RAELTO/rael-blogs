-- ============================================================
-- Row Level Security — base policies
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.posts         enable row level security;
alter table public.categories    enable row level security;
alter table public.tags          enable row level security;
alter table public.post_categories enable row level security;
alter table public.post_tags     enable row level security;

-- profiles
create policy "profiles_select_public" on public.profiles for select using (true);
create policy "profiles_insert_own"    on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"    on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- posts
create policy "posts_select_published" on public.posts for select using (status = 'published');
create policy "posts_select_own"       on public.posts for select using (auth.uid() = author_id);
create policy "posts_insert_own"       on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update_own"       on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete_own"       on public.posts for delete using (auth.uid() = author_id);

-- categories & tags (public read)
create policy "categories_select_public" on public.categories for select using (true);
create policy "tags_select_public"       on public.tags        for select using (true);

-- post_categories
create policy "post_categories_select_public" on public.post_categories for select using (true);
create policy "post_categories_insert_own" on public.post_categories for insert
  with check (exists (select 1 from public.posts where id = post_id and author_id = auth.uid()));
create policy "post_categories_delete_own" on public.post_categories for delete
  using (exists (select 1 from public.posts where id = post_id and author_id = auth.uid()));

-- post_tags
create policy "post_tags_select_public" on public.post_tags for select using (true);
create policy "post_tags_insert_own" on public.post_tags for insert
  with check (exists (select 1 from public.posts where id = post_id and author_id = auth.uid()));
create policy "post_tags_delete_own" on public.post_tags for delete
  using (exists (select 1 from public.posts where id = post_id and author_id = auth.uid()));

