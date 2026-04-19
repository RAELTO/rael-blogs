import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function useLikes(postId: string, userId?: string) {
  return useQuery({
    queryKey: ['likes', postId],
    queryFn: async () => {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

      let liked = false
      if (userId) {
        const { data } = await supabase
          .from('post_likes')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle()
        liked = !!data
      }

      return { count: count ?? 0, liked }
    },
    enabled: !!postId,
  })
}

export function useToggleLike(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, liked }: { userId: string; liked: boolean }) => {
      if (liked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['likes', postId] }),
  })
}
