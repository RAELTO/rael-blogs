import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { type PostWithMeta, type PostJoinRow, mapPostRow } from '../posts/usePosts'

interface BookmarkJoinRow {
  post_id: string
  created_at: string
  posts: PostJoinRow
}

export function useBookmark(postId: string, userId?: string) {
  return useQuery({
    queryKey: ['bookmark', postId, userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('post_bookmarks')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', userId!)
        .maybeSingle()
      return { bookmarked: !!data }
    },
    enabled: !!postId && !!userId,
  })
}

export function useToggleBookmark(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, bookmarked }: { userId: string; bookmarked: boolean }) => {
      if (bookmarked) {
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({ post_id: postId, user_id: userId })
        if (error) throw error
      }
    },
    onSuccess: (_d, { userId }) => {
      qc.invalidateQueries({ queryKey: ['bookmark', postId, userId] })
      qc.invalidateQueries({ queryKey: ['bookmarks', userId] })
    },
  })
}

export function useMyBookmarks(userId?: string) {
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: async (): Promise<PostWithMeta[]> => {
      const { data, error } = await supabase
        .from('post_bookmarks')
        .select(`
          post_id,
          created_at,
          posts!inner (
            id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at,
            profiles!author_id (id, display_name, username, avatar_url),
            post_categories (categories (id, name, slug)),
            post_tags (tags (id, name, slug))
          )
        `)
        .eq('user_id', userId!)
        .eq('posts.status', 'published')
        .order('created_at', { ascending: false })
      if (error) throw error

      return (data as unknown as BookmarkJoinRow[]).map(row => mapPostRow(row.posts))
    },
    enabled: !!userId,
  })
}
