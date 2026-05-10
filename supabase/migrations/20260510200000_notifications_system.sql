-- ============================================================
-- NBOX Notifications System
-- Tabla unificada + 6 triggers SECURITY DEFINER por tabla fuente
-- Eventos: reaction, vote, comment, follow,
--          contact_request, contact_accepted, share
-- contact_declined: sin notificación (decisión de diseño)
-- ============================================================

create table public.notifications (
  id                 uuid primary key default gen_random_uuid(),
  recipient_id       uuid not null references public.profiles on delete cascade,
  actor_id           uuid references public.profiles on delete set null,
  kind               text not null check (kind in (
    'reaction','vote','comment','follow',
    'contact_request','contact_accepted','share'
  )),
  source_table       text not null,
  source_id          uuid,
  box_id             uuid references public.boxes on delete cascade,
  comment_id         uuid references public.box_comments on delete cascade,
  contact_request_id uuid references public.contact_requests on delete cascade,
  metadata           jsonb not null default '{}',
  dedup_key          text,
  read_at            timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Índice parcial: múltiples NULL permitidos, dedup solo donde aplica
create unique index notifications_dedup_key_uidx
  on public.notifications(dedup_key)
  where dedup_key is not null;

alter table public.notifications enable row level security;

create policy "notifs_select_own" on public.notifications
  for select using ((select auth.uid()) = recipient_id);

create policy "notifs_update_own" on public.notifications
  for update
  using  ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

create policy "notifs_delete_own" on public.notifications
  for delete using ((select auth.uid()) = recipient_id);

create index idx_notifications_recipient on public.notifications(recipient_id);
create index idx_notifications_unread    on public.notifications(recipient_id) where read_at is null;
create index idx_notifications_created   on public.notifications(recipient_id, created_at desc);

-- ── box_reactions ───────────────────────────────────────────
create or replace function public.trg_fn_box_reaction_notif()
returns trigger language plpgsql
security definer set search_path = public as $$
declare v_author uuid; v_dedup text;
begin
  if tg_op = 'DELETE' then
    delete from public.notifications where dedup_key = 'reaction:' || old.box_id::text || ':' || old.user_id::text;
    return old;
  end if;
  select author_id into v_author from public.boxes where id = new.box_id;
  if v_author = new.user_id then return new; end if;
  v_dedup := 'reaction:' || new.box_id::text || ':' || new.user_id::text;
  insert into public.notifications (recipient_id, actor_id, kind, source_table, source_id, box_id, metadata, dedup_key)
  values (v_author, new.user_id, 'reaction', 'box_reactions', new.box_id, new.box_id, jsonb_build_object('reaction_type', new.reaction_type), v_dedup)
  on conflict (dedup_key) where dedup_key is not null
  do update set metadata = excluded.metadata, read_at = null, updated_at = now();
  return new;
end; $$;
revoke execute on function public.trg_fn_box_reaction_notif() from public, anon, authenticated;
create trigger trg_box_reaction_notif
  after insert or update or delete on public.box_reactions
  for each row execute function public.trg_fn_box_reaction_notif();

-- ── box_votes ───────────────────────────────────────────────
create or replace function public.trg_fn_box_vote_notif()
returns trigger language plpgsql
security definer set search_path = public as $$
declare v_author uuid; v_dedup text;
begin
  if tg_op = 'DELETE' then
    delete from public.notifications where dedup_key = 'vote:' || old.box_id::text || ':' || old.user_id::text;
    return old;
  end if;
  select author_id into v_author from public.boxes where id = new.box_id;
  if v_author = new.user_id then return new; end if;
  v_dedup := 'vote:' || new.box_id::text || ':' || new.user_id::text;
  insert into public.notifications (recipient_id, actor_id, kind, source_table, source_id, box_id, metadata, dedup_key)
  values (v_author, new.user_id, 'vote', 'box_votes', new.box_id, new.box_id, jsonb_build_object('vote', new.vote), v_dedup)
  on conflict (dedup_key) where dedup_key is not null
  do update set metadata = excluded.metadata, read_at = null, updated_at = now();
  return new;
end; $$;
revoke execute on function public.trg_fn_box_vote_notif() from public, anon, authenticated;
create trigger trg_box_vote_notif
  after insert or update or delete on public.box_votes
  for each row execute function public.trg_fn_box_vote_notif();

-- ── box_comments ────────────────────────────────────────────
create or replace function public.trg_fn_box_comment_notif()
returns trigger language plpgsql
security definer set search_path = public as $$
declare v_author uuid; v_dedup text;
begin
  if tg_op = 'DELETE' then
    delete from public.notifications where dedup_key = 'comment:' || old.id::text;
    return old;
  end if;
  select author_id into v_author from public.boxes where id = new.box_id;
  if v_author = new.author_id then return new; end if;
  v_dedup := 'comment:' || new.id::text;
  insert into public.notifications (recipient_id, actor_id, kind, source_table, source_id, box_id, comment_id, metadata, dedup_key)
  values (v_author, new.author_id, 'comment', 'box_comments', new.id, new.box_id, new.id, '{}', v_dedup)
  on conflict (dedup_key) where dedup_key is not null do nothing;
  return new;
end; $$;
revoke execute on function public.trg_fn_box_comment_notif() from public, anon, authenticated;
create trigger trg_box_comment_notif
  after insert or delete on public.box_comments
  for each row execute function public.trg_fn_box_comment_notif();

-- ── follows ─────────────────────────────────────────────────
create or replace function public.trg_fn_follow_notif()
returns trigger language plpgsql
security definer set search_path = public as $$
declare v_dedup text;
begin
  if tg_op = 'DELETE' then
    delete from public.notifications where dedup_key = 'follow:' || old.following_id::text || ':' || old.follower_id::text;
    return old;
  end if;
  v_dedup := 'follow:' || new.following_id::text || ':' || new.follower_id::text;
  insert into public.notifications (recipient_id, actor_id, kind, source_table, source_id, metadata, dedup_key)
  values (new.following_id, new.follower_id, 'follow', 'follows', new.follower_id, '{}', v_dedup)
  on conflict (dedup_key) where dedup_key is not null
  do update set read_at = null, updated_at = now();
  return new;
end; $$;
revoke execute on function public.trg_fn_follow_notif() from public, anon, authenticated;
create trigger trg_follow_notif
  after insert or delete on public.follows
  for each row execute function public.trg_fn_follow_notif();

-- ── contact_requests ────────────────────────────────────────
create or replace function public.trg_fn_contact_request_notif()
returns trigger language plpgsql
security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (recipient_id, actor_id, kind, source_table, contact_request_id, metadata, dedup_key)
    values (new.addressee_id, new.requester_id, 'contact_request', 'contact_requests', new.id, '{}', 'creq:' || new.id::text)
    on conflict (dedup_key) where dedup_key is not null do nothing;
  elsif tg_op = 'UPDATE' then
    if old.status = 'pending' and new.status = 'accepted' then
      delete from public.notifications where dedup_key = 'creq:' || new.id::text;
      insert into public.notifications (recipient_id, actor_id, kind, source_table, contact_request_id, metadata, dedup_key)
      values (new.requester_id, new.addressee_id, 'contact_accepted', 'contact_requests', new.id, '{}', 'cacc:' || new.id::text)
      on conflict (dedup_key) where dedup_key is not null do nothing;
    elsif old.status = 'pending' and (new.status = 'declined' or new.status = 'canceled') then
      delete from public.notifications where dedup_key = 'creq:' || new.id::text;
    end if;
  end if;
  return new;
end; $$;
revoke execute on function public.trg_fn_contact_request_notif() from public, anon, authenticated;
create trigger trg_contact_request_notif
  after insert or update on public.contact_requests
  for each row execute function public.trg_fn_contact_request_notif();

-- ── box_shares ──────────────────────────────────────────────
create or replace function public.trg_fn_box_share_notif()
returns trigger language plpgsql
security definer set search_path = public as $$
declare v_author uuid; v_dedup text;
begin
  select author_id into v_author from public.boxes where id = new.box_id;
  if v_author = new.user_id then return new; end if;
  v_dedup := 'share:' || new.box_id::text || ':' || new.user_id::text || ':' || new.share_type;
  insert into public.notifications (recipient_id, actor_id, kind, source_table, source_id, box_id, metadata, dedup_key)
  values (v_author, new.user_id, 'share', 'box_shares', new.id, new.box_id, jsonb_build_object('share_type', new.share_type), v_dedup)
  on conflict (dedup_key) where dedup_key is not null
  do update set updated_at = now();
  return new;
end; $$;
revoke execute on function public.trg_fn_box_share_notif() from public, anon, authenticated;
create trigger trg_box_share_notif
  after insert on public.box_shares
  for each row execute function public.trg_fn_box_share_notif();
