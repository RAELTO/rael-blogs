-- ============================================================
-- Initial schema: core tables
-- ============================================================

create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text not null,
  username    text not null unique,
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table public.posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles on delete cascade,
  title           text not null,
  slug            text not null unique,
  excerpt         text,
  content         text not null default '',
  cover_image_url text,
  status          text not null default 'draft',
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.post_categories (
  post_id     uuid not null references public.posts on delete cascade,
  category_id uuid not null references public.categories on delete cascade,
  primary key (post_id, category_id)
);

create table public.post_tags (
  post_id uuid not null references public.posts on delete cascade,
  tag_id  uuid not null references public.tags on delete cascade,
  primary key (post_id, tag_id)
);
