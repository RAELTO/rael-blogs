import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { type PostWithMeta, type PostJoinRow, mapPostRow } from './usePosts'

interface PostCategoryJoinRow {
  posts: PostJoinRow
}

async function fetchPostsByCategory(slug: string): Promise<PostWithMeta[]> {
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (!cat) return []

  const { data, error } = await supabase
    .from('post_categories')
    .select(`
      posts!inner (
        id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at,
        profiles!author_id (id, display_name, username, avatar_url),
        post_categories (categories (id, name, slug)),
        post_tags (tags (id, name, slug))
      )
    `)
    .eq('category_id', cat.id)
    .eq('posts.status', 'published')

  if (error) throw error

  return (data as unknown as PostCategoryJoinRow[]).map(row => mapPostRow(row.posts))
}

export function usePostsByCategory(slug: string) {
  return useQuery({
    queryKey: ['posts', 'category', slug],
    queryFn: () => fetchPostsByCategory(slug),
    enabled: !!slug,
  })
}
