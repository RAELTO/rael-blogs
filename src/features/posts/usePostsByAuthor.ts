import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { type PostWithMeta, type PostJoinRow, mapPostRow } from './usePosts'

type AuthorMeta = {
  id: string
  display_name: string
  username: string
  bio: string | null
  avatar_url: string | null
  role: string
  is_banned: boolean
}

async function fetchPostsByAuthor(username: string): Promise<{ posts: PostWithMeta[]; author: AuthorMeta | null }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username, bio, avatar_url, role, is_banned')
    .eq('username', username)
    .maybeSingle()

  if (!profile) return { posts: [], author: null }

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at,
      profiles!author_id (id, display_name, username, avatar_url),
      post_categories (categories (id, name, slug)),
      post_tags (tags (id, name, slug))
    `)
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error

  return {
    posts: (data as unknown as PostJoinRow[]).map(mapPostRow),
    author: profile,
  }
}

export function usePostsByAuthor(username: string) {
  return useQuery({
    queryKey: ['posts', 'author', username],
    queryFn: () => fetchPostsByAuthor(username),
    enabled: !!username,
  })
}
