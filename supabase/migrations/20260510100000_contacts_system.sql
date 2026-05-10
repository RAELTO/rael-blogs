-- ============================================================
-- NBOX Contacts System
-- contact_requests (bidireccional con estados) + contacts
-- ============================================================

create table public.contact_requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles on delete cascade,
  addressee_id uuid not null references public.profiles on delete cascade,
  status       text not null default 'pending'
               check (status in ('pending','accepted','declined','canceled')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  unique (requester_id, addressee_id),
  check (requester_id != addressee_id)
);

alter table public.contact_requests enable row level security;

create policy "creq_select_own" on public.contact_requests
  for select using (
    (select auth.uid()) = requester_id or
    (select auth.uid()) = addressee_id
  );

create policy "creq_insert_auth" on public.contact_requests
  for insert with check (
    (select auth.uid()) = requester_id and not is_banned()
  );

create policy "creq_update_parties" on public.contact_requests
  for update
  using (
    (select auth.uid()) = requester_id or
    (select auth.uid()) = addressee_id
  )
  with check (
    ((select auth.uid()) = requester_id and status = 'canceled')
    or
    ((select auth.uid()) = addressee_id and status in ('accepted','declined'))
  );

-- contacts: user_a < user_b evita filas duplicadas para la misma pareja
create table public.contacts (
  user_a     uuid not null references public.profiles on delete cascade,
  user_b     uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);

alter table public.contacts enable row level security;

create policy "contacts_select_own" on public.contacts
  for select using (
    (select auth.uid()) = user_a or (select auth.uid()) = user_b
  );

create policy "contacts_insert_via_request" on public.contacts
  for insert with check (
    ((select auth.uid()) = user_a or (select auth.uid()) = user_b)
    and exists (
      select 1 from public.contact_requests
      where ((requester_id = user_a and addressee_id = user_b)
          or (requester_id = user_b and addressee_id = user_a))
      and status = 'accepted'
    )
  );

create policy "contacts_delete_own" on public.contacts
  for delete using (
    (select auth.uid()) = user_a or (select auth.uid()) = user_b
  );

create index idx_contact_requests_addressee on public.contact_requests(addressee_id);
create index idx_contact_requests_requester on public.contact_requests(requester_id);
create index idx_contact_requests_status    on public.contact_requests(status);
create index idx_contacts_user_a            on public.contacts(user_a);
create index idx_contacts_user_b            on public.contacts(user_b);
