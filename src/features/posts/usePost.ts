import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { type PostWithMeta, type PostJoinRow, mapPostRow } from './usePosts'

async function fetchPostBySlug(slug: string): Promise<PostWithMeta | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at,
      profiles!author_id (id, display_name, username, avatar_url),
      post_categories (categories (id, name, slug)),
      post_tags (tags (id, name, slug))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapPostRow(data as unknown as PostJoinRow)
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
  })
}
