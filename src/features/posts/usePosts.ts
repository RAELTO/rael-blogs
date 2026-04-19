import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type CoverType = 'image' | 'gif' | 'infographic' | 'audio' | 'video'

export interface PostWithMeta {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  cover_type: CoverType
  status: string
  published_at: string | null
  created_at: string
  author: {
    id: string
    display_name: string
    username: string
    avatar_url: string | null
  }
  categories: { id: string; name: string; slug: string }[]
  tags: { id: string; name: string; slug: string }[]
  // Dashboard-only counts (populated by useMyPosts)
  likes_count?: number
  comments_count?: number
}

// Raw shape Supabase returns for the standard post+joins query
export interface PostJoinRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  cover_type: CoverType
  status: string
  published_at: string | null
  created_at: string
  profiles: { id: string; display_name: string; username: string; avatar_url: string | null } | null
  post_categories: Array<{ categories: { id: string; name: string; slug: string } | null }>
  post_tags: Array<{ tags: { id: string; name: string; slug: string } | null }>
  post_likes?: Array<{ count: number }>
  comments?: Array<{ count: number }>
}

export function mapPostRow(p: PostJoinRow): PostWithMeta {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    cover_image_url: p.cover_image_url,
    cover_type: p.cover_type ?? 'gif',
    status: p.status,
    published_at: p.published_at,
    created_at: p.created_at,
    author: p.profiles!,
    categories: p.post_categories
      .map(pc => pc.categories)
      .filter((c): c is { id: string; name: string; slug: string } => c !== null),
    tags: p.post_tags
      .map(pt => pt.tags)
      .filter((t): t is { id: string; name: string; slug: string } => t !== null),
    likes_count: p.post_likes?.[0]?.count ?? 0,
    comments_count: p.comments?.[0]?.count ?? 0,
  }
}

async function fetchPublishedPosts(): Promise<PostWithMeta[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, content, cover_image_url, cover_type, status, published_at, created_at,
      profiles!author_id (id, display_name, username, avatar_url),
      post_categories (categories (id, name, slug)),
      post_tags (tags (id, name, slug))
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error

  return (data as unknown as PostJoinRow[]).map(mapPostRow)
}

export function usePosts() {
  return useQuery({
    queryKey: ['posts', 'published'],
    queryFn: fetchPublishedPosts,
  })
}
