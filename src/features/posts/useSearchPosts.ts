import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { mapPostRow, type PostWithMeta, type PostJoinRow } from './usePosts'

const POST_SELECT = `
  id, title, slug, excerpt, content, cover_image_url, cover_type,
  status, published_at, created_at,
  profiles!author_id (id, display_name, username, avatar_url),
  post_categories (categories (id, name, slug)),
  post_tags (tags (id, name, slug)),
  post_likes(count),
  comments(count)
`

export function useSearchPosts(q: string): {
  data: PostWithMeta[]
  isLoading: boolean
  isError: boolean
} {
  const trimmed = q.trim()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts-search', trimmed],
    queryFn: async () => {
      // 1. Obtener IDs de posts que coinciden (busca en título, excerpt, slug, autor, categoría y tag)
      const { data: ids, error: rpcError } = await supabase
        .rpc('search_posts', { q: trimmed, lim: 50 })
      if (rpcError) throw rpcError

      if (!ids || ids.length === 0) return []

      const postIds = (ids as { id: string }[]).map(r => r.id)

      // 2. Cargar esos posts con todas las relaciones necesarias
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .in('id', postIds)
        .order('published_at', { ascending: false })
      if (error) throw error

      return (data as unknown as PostJoinRow[]).map(mapPostRow)
    },
    enabled: trimmed.length >= 2,
  })

  return { data: data ?? [], isLoading, isError }
}
