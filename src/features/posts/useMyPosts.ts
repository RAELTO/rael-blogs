import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { type PostWithMeta, type PostJoinRow, mapPostRow } from './usePosts'

async function fetchMyPosts(): Promise<PostWithMeta[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at,
      profiles!author_id (id, display_name, username, avatar_url),
      post_categories (categories (id, name, slug)),
      post_tags (tags (id, name, slug)),
      post_likes(count),
      comments(count)
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as unknown as PostJoinRow[]).map(p => ({
    ...mapPostRow(p),
    likes_count: (p.post_likes?.[0] as unknown as { count: number } | undefined)?.count ?? 0,
    comments_count: (p.comments?.[0] as unknown as { count: number } | undefined)?.count ?? 0,
  }))
}

export function useMyPosts() {
  return useQuery({
    queryKey: ['posts', 'mine'],
    queryFn: fetchMyPosts,
  })
}
