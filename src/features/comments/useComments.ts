import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export interface CommentWithAuthor {
  id: string
  box_id: string
  author_id: string
  content: string
  created_at: string
  author: { id: string; username: string; display_name: string; avatar_url: string | null; role?: string }
  engagement_count: number  // votes (like+dislike) + reactions total
}

export function useComments(boxId: string) {
  return useQuery({
    queryKey: ['comments', boxId],
    queryFn: async () => {
      // 1. Fetch comments with author
      const { data: comments, error } = await supabase
        .from('box_comments')
        .select('*, author:profiles!box_comments_author_id_fkey(id, username, display_name, avatar_url, role)')
        .eq('box_id', boxId)
        .order('created_at', { ascending: true })
      if (error) throw error
      if (!comments?.length) return []

      const ids = comments.map(c => c.id)

      // 2. Fetch all votes + reactions for these comments in parallel
      const [votesRes, reactionsRes] = await Promise.all([
        supabase.from('comment_votes').select('comment_id').in('comment_id', ids),
        supabase.from('comment_reactions').select('comment_id').in('comment_id', ids),
      ])

      // 3. Build engagement map (votes + reactions count together)
      const engagement: Record<string, number> = {}
      for (const v of votesRes.data ?? [])     engagement[v.comment_id] = (engagement[v.comment_id] ?? 0) + 1
      for (const r of reactionsRes.data ?? []) engagement[r.comment_id] = (engagement[r.comment_id] ?? 0) + 1

      return comments.map(c => ({
        ...c,
        engagement_count: engagement[c.id] ?? 0,
      })) as CommentWithAuthor[]
    },
    staleTime: 30_000,
  })
}

export function useCreateComment(boxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ authorId, content }: { authorId: string; content: string }) => {
      const { data, error } = await supabase
        .from('box_comments')
        .insert({ box_id: boxId, author_id: authorId, content })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', boxId] })
      qc.invalidateQueries({ queryKey: ['boxes', 'feed'] })
    },
  })
}

export function useDeleteComment(boxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('box_comments').delete().eq('id', commentId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', boxId] })
      qc.invalidateQueries({ queryKey: ['boxes', 'feed'] })
    },
  })
}
