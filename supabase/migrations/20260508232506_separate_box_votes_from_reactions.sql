-- Separate like/dislike into a dedicated box_votes table.
-- box_reactions is now emoji-only.

-- ---- 1. box_votes table -----------------------------------
create table public.box_votes (
  box_id     uuid not null references public.boxes    on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,
  vote       text not null check (vote in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  primary key (box_id, user_id)
);

alter table public.box_votes enable row level security;

create policy "box_votes_select_public" on public.box_votes
  for select using (true);

create policy "box_votes_insert_auth" on public.box_votes
  for insert with check (auth.uid() = user_id and not is_banned());

create policy "box_votes_update_own" on public.box_votes
  for update using (auth.uid() = user_id and not is_banned());

create policy "box_votes_delete_own" on public.box_votes
  for delete using (auth.uid() = user_id);

-- ---- 2. Remove like/dislike from box_reactions constraint --
delete from public.box_reactions where reaction_type in ('like','dislike');

alter table public.box_reactions
  drop constraint if exists box_reactions_reaction_type_check;

alter table public.box_reactions
  add constraint box_reactions_reaction_type_check
    check (reaction_type in ('bold','loud','fire','sharp','save','angry'));
