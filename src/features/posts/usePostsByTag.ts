import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { type PostWithMeta, type PostJoinRow, mapPostRow } from './usePosts'

interface PostTagJoinRow {
  posts: PostJoinRow
}

async function fetchPostsByTag(slug: string): Promise<PostWithMeta[]> {
  const { data: tag } = await supabase
    .from('tags')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle()

  if (!tag) return []

  const { data, error } = await supabase
    .from('post_tags')
    .select(`
      posts!inner (
        id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at,
        profiles!author_id (id, display_name, username, avatar_url),
        post_categories (categories (id, name, slug)),
        post_tags (tags (id, name, slug))
      )
    `)
    .eq('tag_id', tag.id)
    .eq('posts.status', 'published')

  if (error) throw error

  return (data as unknown as PostTagJoinRow[]).map(row => mapPostRow(row.posts))
}

export function usePostsByTag(slug: string) {
  return useQuery({
    queryKey: ['posts', 'tag', slug],
    queryFn: () => fetchPostsByTag(slug),
    enabled: !!slug,
  })
}
