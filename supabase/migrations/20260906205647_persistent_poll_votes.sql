create schema if not exists private;

revoke all on schema private from public;

create table public.box_poll_votes (
  box_id uuid not null references public.boxes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  option_index smallint not null check (option_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (box_id, user_id)
);

comment on table public.box_poll_votes is
  'Stores the current poll selection for each user and box.';

alter table public.box_poll_votes enable row level security;

create or replace function private.validate_box_poll_vote()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  poll_options jsonb;
begin
  select payload -> 'options'
    into poll_options
    from public.boxes
   where id = new.box_id
     and type = 'poll';

  if poll_options is null
     or jsonb_typeof(poll_options) <> 'array'
     or new.option_index >= jsonb_array_length(poll_options) then
    raise exception 'Invalid poll option for box %', new.box_id
      using errcode = '23514';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.validate_box_poll_vote() from public;

create trigger validate_box_poll_vote
before insert or update on public.box_poll_votes
for each row execute function private.validate_box_poll_vote();

create policy "Poll selections are publicly readable"
on public.box_poll_votes
for select
to anon, authenticated
using (true);

create policy "Users can create their own poll selection"
on public.box_poll_votes
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and not (select public.is_banned())
);

create policy "Users can change their own poll selection"
on public.box_poll_votes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and not (select public.is_banned())
);

create policy "Users can remove their own poll selection"
on public.box_poll_votes
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.box_poll_votes from anon, authenticated;
grant select on table public.box_poll_votes to anon, authenticated;
grant insert, update, delete on table public.box_poll_votes to authenticated;
