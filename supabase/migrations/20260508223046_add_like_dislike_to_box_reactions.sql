-- Extend box_reactions to temporarily support like/dislike types
-- (these will be separated into box_votes in a later migration)
alter table public.box_reactions
  drop constraint if exists box_reactions_reaction_type_check;

alter table public.box_reactions
  add constraint box_reactions_reaction_type_check
    check (reaction_type in ('bold','loud','fire','sharp','save','like','dislike'));
