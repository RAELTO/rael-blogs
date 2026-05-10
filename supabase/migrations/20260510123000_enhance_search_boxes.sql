-- Expand global search to boxes, authors, and tags while keeping the
-- existing search_boxes(q, lim) API used by the frontend.

create or replace function public.search_boxes(q text, lim integer default 20)
returns setof public.boxes
language sql
stable
security definer
set search_path = public
as $$
  with input as (
    select
      trim(coalesce(q, '')) as term,
      regexp_replace(trim(coalesce(q, '')), '^#', '') as tag_term,
      least(greatest(coalesce(lim, 20), 1), 50) as max_rows
  ),
  ranked as (
    select distinct on (b.id)
      b.*,
      case
        when lower(pr.username) = lower(i.term) then 100
        when lower(pr.display_name) = lower(i.term) then 90
        when lower(t.slug) = lower(i.tag_term) then 85
        when b.content ilike i.term || '%' then 70
        when pr.username ilike i.term || '%' then 60
        when pr.display_name ilike i.term || '%' then 55
        when t.name ilike i.tag_term || '%' or t.slug ilike i.tag_term || '%' then 50
        else 10
      end as search_rank
    from public.boxes b
    cross join input i
    left join public.profiles pr on pr.id = b.author_id
    left join public.box_tags bt on bt.box_id = b.id
    left join public.tags t on t.id = bt.tag_id
    where length(i.term) >= 2
      and b.status = 'published'
      and (
        b.content ilike '%' || i.term || '%'
        or pr.username ilike '%' || i.term || '%'
        or pr.display_name ilike '%' || i.term || '%'
        or t.name ilike '%' || i.tag_term || '%'
        or t.slug ilike '%' || i.tag_term || '%'
      )
    order by b.id, search_rank desc, b.published_at desc nulls last
  )
  select
    ranked.id,
    ranked.author_id,
    ranked.type,
    ranked.content,
    ranked.payload,
    ranked.status,
    ranked.published_at,
    ranked.created_at,
    ranked.updated_at
  from ranked, input
  order by ranked.search_rank desc, ranked.published_at desc nulls last
  limit (select max_rows from input);
$$;

revoke execute on function public.search_boxes(text, integer) from anon;
grant execute on function public.search_boxes(text, integer) to authenticated;
