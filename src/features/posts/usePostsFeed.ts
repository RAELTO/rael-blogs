import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { mapPostRow, type PostWithMeta, type PostJoinRow } from './usePosts'

const PAGE_SIZE = 9

const POST_SELECT = `
  id, title, slug, excerpt, content, cover_image_url, cover_type,
  status, published_at, created_at,
  profiles!author_id (id, display_name, username, avatar_url),
  post_categories (categories (id, name, slug)),
  post_tags (tags (id, name, slug)),
  post_likes(count),
  comments(count)
`

export function usePostsFeed() {
  return useInfiniteQuery({
    queryKey: ['posts-feed'],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const from = pageParam * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      return (data as unknown as PostJoinRow[]).map(mapPostRow)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PostWithMeta[], allPages: PostWithMeta[][]) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  })
}
