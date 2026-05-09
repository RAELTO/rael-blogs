import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export interface CommentWithAuthor {
  id: string
  box_id: string
  author_id: string
  content: string
  created_at: string
  author: { id: string; username: string; display_name: string; avatar_url: string | null }
}

export function useComments(boxId: string) {
  return useQuery({
    queryKey: ['comments', boxId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('box_comments')
        .select('*, author:profiles!box_comments_author_id_fkey(id, username, display_name, avatar_url)')
        .eq('box_id', boxId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as CommentWithAuthor[]
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
