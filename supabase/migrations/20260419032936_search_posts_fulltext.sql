-- ============================================================
-- Full-text search RPC: searches title, excerpt, slug, author,
-- category name and tag name across published posts.
-- ============================================================

create or replace function public.search_posts(q text, lim integer default 50)
returns table (
  id              uuid,
  title           text,
  slug            text,
  excerpt         text,
  content         text,
  cover_image_url text,
  cover_type      text,
  status          text,
  published_at    timestamptz,
  created_at      timestamptz
)
language sql stable security definer as $$
  select distinct
    p.id, p.title, p.slug, p.excerpt, p.content,
    p.cover_image_url, p.cover_type::text, p.status,
    p.published_at, p.created_at
  from public.posts p
  left join public.profiles pr     on pr.id  = p.author_id
  left join public.post_categories pc on pc.post_id = p.id
  left join public.categories cat  on cat.id = pc.category_id
  left join public.post_tags pt    on pt.post_id = p.id
  left join public.tags t          on t.id  = pt.tag_id
  where p.status = 'published'
    and (
      p.title          ilike '%' || q || '%' or
      p.excerpt        ilike '%' || q || '%' or
      p.slug           ilike '%' || q || '%' or
      pr.display_name  ilike '%' || q || '%' or
      pr.username      ilike '%' || q || '%' or
      cat.name         ilike '%' || q || '%' or
      t.name           ilike '%' || q || '%'
    )
  order by p.published_at desc
  limit lim;
$$;
