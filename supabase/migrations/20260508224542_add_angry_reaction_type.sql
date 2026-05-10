-- Add 'angry' emoji reaction type to box_reactions
alter table public.box_reactions
  drop constraint if exists box_reactions_reaction_type_check;

alter table public.box_reactions
  add constraint box_reactions_reaction_type_check
    check (reaction_type in ('bold','loud','fire','sharp','save','like','dislike','angry'));
