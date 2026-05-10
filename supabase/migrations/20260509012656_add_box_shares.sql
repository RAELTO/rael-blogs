-- Track share events per box (feed repost, WhatsApp, link copy, etc.)

create table public.box_shares (
  id         uuid primary key default gen_random_uuid(),
  box_id     uuid not null references public.boxes    on delete cascade,
  user_id    uuid not null references public.profiles on delete cascade,
  share_type text not null
    check (share_type in ('feed','whatsapp','link','contact','group')),
  created_at timestamptz not null default now()
);

alter table public.box_shares enable row level security;

create policy "bshares_select" on public.box_shares
  for select using (true);

create policy "bshares_insert" on public.box_shares
  for insert with check (auth.uid() = user_id and not is_banned());

create policy "bshares_delete" on public.box_shares
  for delete using (auth.uid() = user_id);
