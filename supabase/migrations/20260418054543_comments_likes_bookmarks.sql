-- ============================================================
-- Comments, likes and bookmarks tables
-- ============================================================

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts on delete cascade,
  author_id  uuid not null references public.profiles on delete cascade,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_likes (
  post_id    uuid not null references public.posts on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.post_bookmarks (
  post_id    uuid not null references public.posts on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.comments      enable row level security;
alter table public.post_likes    enable row level security;
alter table public.post_bookmarks enable row level security;

-- comments
create policy "Comments are public"             on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert
  with check (auth.uid() = author_id);
create policy "Authors can delete own comments" on public.comments for delete
  using (auth.uid() = author_id);

-- post_likes
create policy "Likes are public"             on public.post_likes for select using (true);
create policy "Authenticated users can like" on public.post_likes for insert
  with check (auth.uid() = user_id);
create policy "Users can unlike"             on public.post_likes for delete
  using (auth.uid() = user_id);

-- post_bookmarks
create policy "Users see own bookmarks"    on public.post_bookmarks for select using (auth.uid() = user_id);
create policy "Users can bookmark"         on public.post_bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can remove bookmarks" on public.post_bookmarks for delete using (auth.uid() = user_id);
