-- ============================================================
-- NBOX Phase 1: Blog → Social Network schema
-- Drops blog-centric tables, creates NBOX core tables.
-- Profiles and tags are preserved.
-- ============================================================

-- ---- 1. Drop blog tables (FK-safe order) ------------------
drop table if exists public.post_categories cascade;
drop table if exists public.post_bookmarks  cascade;
drop table if exists public.post_likes      cascade;
drop table if exists public.post_tags       cascade;
drop table if exists public.comments        cascade;
drop table if exists public.posts           cascade;
drop table if exists public.categories      cascade;

-- ---- 2. Drop old functions (cascade removes dependent policies) --
drop function if exists public.search_posts(text, integer) cascade;
drop function if exists public.is_banned() cascade;

-- ---- 3. boxes (core content table) ------------------------
create table public.boxes (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles on delete cascade,
  type         text not null default 'quick'
               check (type in ('quick','media','poll','mood','link','thread')),
  content      text not null default '',
  payload      jsonb not null default '{}',
  status       text not null default 'published'
               check (status in ('published','draft','archived')),
  published_at timestamptz default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---- 4. box_tags junction ---------------------------------
create table public.box_tags (
  box_id uuid not null references public.boxes on delete cascade,
  tag_id uuid not null references public.tags  on delete cascade,
  primary key (box_id, tag_id)
);

-- ---- 5. box_reactions (emoji reactions per user per box) --
create table public.box_reactions (
  box_id        uuid not null references public.boxes    on delete cascade,
  user_id       uuid not null references public.profiles on delete cascade,
  reaction_type text not null
                check (reaction_type in ('bold','loud','fire','sharp','save')),
  created_at    timestamptz not null default now(),
  primary key (box_id, user_id)
);

-- ---- 6. box_saves -----------------------------------------
create table public.box_saves (
  box_id     uuid not null references public.boxes    on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (box_id, user_id)
);

-- ---- 7. box_comments --------------------------------------
create table public.box_comments (
  id         uuid primary key default gen_random_uuid(),
  box_id     uuid not null references public.boxes    on delete cascade,
  author_id  uuid not null references public.profiles on delete cascade,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- 8. follows (social graph) ----------------------------
create table public.follows (
  follower_id  uuid not null references public.profiles on delete cascade,
  following_id uuid not null references public.profiles on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- ---- 9. Enable RLS ----------------------------------------
alter table public.boxes         enable row level security;
alter table public.box_tags      enable row level security;
alter table public.box_reactions enable row level security;
alter table public.box_saves     enable row level security;
alter table public.box_comments  enable row level security;
alter table public.follows       enable row level security;

-- ---- 10. is_banned helper ---------------------------------
create or replace function public.is_banned()
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select is_banned from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ---- 11. RLS: boxes ----------------------------------------
create policy "boxes_select_public" on public.boxes for select
  using (status = 'published' or auth.uid() = author_id);

create policy "boxes_insert_own" on public.boxes for insert
  with check (auth.uid() = author_id and not public.is_banned());

create policy "boxes_update_own" on public.boxes for update
  using  (auth.uid() = author_id and not public.is_banned())
  with check (auth.uid() = author_id and not public.is_banned());

create policy "boxes_delete_own" on public.boxes for delete
  using (auth.uid() = author_id);

create policy "admin_update_any_box" on public.boxes for update
  using  (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "admin_delete_any_box" on public.boxes for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ---- 12. RLS: box_tags -------------------------------------
create policy "box_tags_select_public" on public.box_tags for select using (true);

create policy "box_tags_insert_own" on public.box_tags for insert
  with check (
    exists (select 1 from public.boxes where id = box_id and author_id = auth.uid())
    and not public.is_banned()
  );

create policy "box_tags_delete_own" on public.box_tags for delete
  using (exists (select 1 from public.boxes where id = box_id and author_id = auth.uid()));

-- ---- 13. RLS: box_reactions --------------------------------
create policy "box_reactions_select_public" on public.box_reactions for select using (true);

create policy "box_reactions_insert_auth" on public.box_reactions for insert
  with check (auth.uid() = user_id and not public.is_banned());

create policy "box_reactions_update_own" on public.box_reactions for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id and not public.is_banned());

create policy "box_reactions_delete_own" on public.box_reactions for delete
  using (auth.uid() = user_id);

-- ---- 14. RLS: box_saves ------------------------------------
create policy "box_saves_select_own" on public.box_saves for select using (auth.uid() = user_id);

create policy "box_saves_insert_auth" on public.box_saves for insert
  with check (auth.uid() = user_id and not public.is_banned());

create policy "box_saves_delete_own" on public.box_saves for delete
  using (auth.uid() = user_id);

-- ---- 15. RLS: box_comments ---------------------------------
create policy "box_comments_select_public" on public.box_comments for select using (true);

create policy "box_comments_insert_auth" on public.box_comments for insert
  with check (auth.uid() = author_id and not public.is_banned());

create policy "box_comments_delete_own" on public.box_comments for delete
  using (auth.uid() = author_id);

create policy "admin_delete_any_box_comment" on public.box_comments for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ---- 16. RLS: follows --------------------------------------
create policy "follows_select_public" on public.follows for select using (true);

create policy "follows_insert_auth" on public.follows for insert
  with check (auth.uid() = follower_id and not public.is_banned());

create policy "follows_delete_own" on public.follows for delete
  using (auth.uid() = follower_id);

-- ---- 17. tags: restore insert policy ----------------------
drop policy if exists "tags_insert_authenticated" on public.tags;
create policy "tags_insert_authenticated" on public.tags
  for insert to authenticated
  with check (not public.is_banned());

-- ---- 18. search_boxes RPC ---------------------------------
create or replace function public.search_boxes(q text, lim integer default 20)
returns setof public.boxes
language sql stable security definer set search_path = public
as $$
  select * from public.boxes
  where status = 'published'
    and content ilike '%' || q || '%'
  order by published_at desc
  limit lim;
$$;
