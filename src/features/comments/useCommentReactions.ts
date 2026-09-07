import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ReactionType } from '../../types/database'

export function useMyCommentReaction(commentId: string, userId?: string) {
  return useQuery({
    queryKey: ['c-reaction', commentId, userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('comment_reactions')
        .select('reaction_type')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return (data?.reaction_type ?? null) as ReactionType | null
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}

export function useCommentReactionCounts(commentId: string) {
  return useQuery({
    queryKey: ['c-reaction-counts', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_reactions')
        .select('reaction_type')
        .eq('comment_id', commentId)
      if (error) throw error
      const counts: Record<ReactionType, number> = { bold: 0, loud: 0, fire: 0, sharp: 0, save: 0, angry: 0 }
      for (const r of data ?? []) counts[r.reaction_type as ReactionType]++
      return counts
    },
    staleTime: 30_000,
  })
}

export interface CommentReactionDetailRow {
  reaction_type: ReactionType
  user_id: string
  profiles: { id: string; username: string; display_name: string; avatar_url: string | null; role: string | null }
}

export function useCommentReactionDetails(commentId: string, enabled = false) {
  return useQuery({
    queryKey: ['c-reaction-details', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_reactions')
        .select('reaction_type, user_id, profiles(id, username, display_name, avatar_url, role)')
        .eq('comment_id', commentId)
      if (error) throw error
      return (data ?? []) as unknown as CommentReactionDetailRow[]
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useToggleCommentReaction(commentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, type, current }: { userId: string; type: ReactionType; current: ReactionType | null }) => {
      if (current === type) {
        const { error } = await supabase.from('comment_reactions').delete().eq('comment_id', commentId).eq('user_id', userId)
        if (error) throw error
      } else if (current) {
        const { error } = await supabase.from('comment_reactions').update({ reaction_type: type }).eq('comment_id', commentId).eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('comment_reactions').insert({ comment_id: commentId, user_id: userId, reaction_type: type })
        if (error) throw error
      }
    },
    onSuccess: (_d, { userId }) => {
      qc.invalidateQueries({ queryKey: ['c-reaction', commentId, userId] })
      qc.invalidateQueries({ queryKey: ['c-reaction-counts', commentId] })
      qc.invalidateQueries({ queryKey: ['c-reaction-details', commentId] })
      qc.invalidateQueries({ queryKey: ['c-activity-count', commentId] })
    },
  })
}
