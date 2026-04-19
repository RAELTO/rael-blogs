import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { sanitizeText } from '../../lib/sanitize'

export interface Comment {
  id: string
  author_id: string
  content: string
  created_at: string
  author: { display_name: string; username: string; avatar_url: string | null }
}

interface CommentJoinRow {
  id: string
  author_id: string
  content: string
  created_at: string
  profiles: { display_name: string; username: string; avatar_url: string | null } | null
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('id, author_id, content, created_at, profiles!author_id (display_name, username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data as unknown as CommentJoinRow[]).map(c => ({
        id: c.id,
        author_id: c.author_id,
        content: c.content,
        created_at: c.created_at,
        author: c.profiles!,
      }))
    },
    enabled: !!postId,
  })
}

export function useCreateComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ content, authorId }: { content: string; authorId: string }) => {
      const clean = sanitizeText(content).slice(0, 2000)
      if (!clean) throw new Error('El comentario no puede estar vacío.')
      const { error } = await supabase
        .from('comments')
        .insert({ post_id: postId, author_id: authorId, content: clean })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  })
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  })
}
