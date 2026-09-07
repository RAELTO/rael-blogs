-- Harden trigger helpers and exposed RPC functions reported by Supabase's
-- Security Advisor. User-facing RPCs keep their signatures and now rely on
-- the existing RLS policies instead of bypassing them.

create schema if not exists private;
revoke all on schema private from public;

-- Trigger-only helpers do not belong in the Data API's exposed schema.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Usuario'),
    coalesce(
      new.raw_user_meta_data ->> 'username',
      'user_' || substr(new.id::text, 1, 8)
    )
  );

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

drop function public.handle_new_user();

create or replace function private.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.handle_updated_at() from public, anon, authenticated;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function private.handle_updated_at();

drop function public.handle_updated_at();

-- These helpers do not need elevated privileges. SECURITY INVOKER preserves
-- their public API while making the existing RLS policies authoritative.
alter function public.is_banned() security invoker;
alter function public.is_banned() set search_path = '';
revoke execute on function public.is_banned() from public, anon;
grant execute on function public.is_banned() to authenticated, service_role;

alter function public.search_boxes(text, integer) security invoker;
alter function public.search_boxes(text, integer) set search_path = '';
revoke execute on function public.search_boxes(text, integer) from public, anon;
grant execute on function public.search_boxes(text, integer) to authenticated, service_role;

alter function public.accept_contact_request(uuid) security invoker;
alter function public.accept_contact_request(uuid) set search_path = '';
revoke execute on function public.accept_contact_request(uuid) from public, anon;
grant execute on function public.accept_contact_request(uuid) to authenticated, service_role;
