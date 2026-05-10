-- Votes and emoji reactions for individual comments

-- ---- 1. comment_votes -------------------------------------
create table public.comment_votes (
  comment_id uuid not null references public.box_comments on delete cascade,
  user_id    uuid not null references public.profiles      on delete cascade,
  vote       text not null check (vote in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_votes enable row level security;

create policy "cvotes_select" on public.comment_votes
  for select using (true);

create policy "cvotes_insert" on public.comment_votes
  for insert with check (auth.uid() = user_id and not is_banned());

create policy "cvotes_update" on public.comment_votes
  for update using (auth.uid() = user_id and not is_banned());

create policy "cvotes_delete" on public.comment_votes
  for delete using (auth.uid() = user_id);

-- ---- 2. comment_reactions ----------------------------------
create table public.comment_reactions (
  comment_id    uuid not null references public.box_comments on delete cascade,
  user_id       uuid not null references public.profiles      on delete cascade,
  reaction_type text not null
    check (reaction_type in ('bold','loud','fire','sharp','save','angry')),
  created_at    timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_reactions enable row level security;

create policy "creacts_select" on public.comment_reactions
  for select using (true);

create policy "creacts_insert" on public.comment_reactions
  for insert with check (auth.uid() = user_id and not is_banned());

create policy "creacts_update" on public.comment_reactions
  for update using (auth.uid() = user_id and not is_banned());

create policy "creacts_delete" on public.comment_reactions
  for delete using (auth.uid() = user_id);
