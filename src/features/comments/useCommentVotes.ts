import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { VoteType } from '../../types/database'

export function useMyCommentVote(commentId: string, userId?: string) {
  return useQuery({
    queryKey: ['c-vote', commentId, userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('comment_votes')
        .select('vote')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return (data?.vote ?? null) as VoteType | null
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}

export function useCommentVoteCounts(commentId: string) {
  return useQuery({
    queryKey: ['c-vote-counts', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_votes')
        .select('vote')
        .eq('comment_id', commentId)
      if (error) throw error
      const counts = { like: 0, dislike: 0 }
      for (const r of data ?? []) counts[r.vote as VoteType]++
      return counts
    },
    staleTime: 30_000,
  })
}

export interface CommentVoteDetailRow {
  vote: VoteType
  user_id: string
  profiles: { id: string; username: string; display_name: string; avatar_url: string | null; role: string | null }
}

export function useCommentVoteDetails(commentId: string, enabled = false) {
  return useQuery({
    queryKey: ['c-vote-details', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_votes')
        .select('vote, user_id, profiles(id, username, display_name, avatar_url, role)')
        .eq('comment_id', commentId)
      if (error) throw error
      return (data ?? []) as unknown as CommentVoteDetailRow[]
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useToggleCommentVote(commentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, vote, current }: { userId: string; vote: VoteType; current: VoteType | null }) => {
      if (current === vote) {
        const { error } = await supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', userId)
        if (error) throw error
      } else if (current) {
        const { error } = await supabase.from('comment_votes').update({ vote }).eq('comment_id', commentId).eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('comment_votes').insert({ comment_id: commentId, user_id: userId, vote })
        if (error) throw error
      }
    },
    onSuccess: (_d, { userId }) => {
      qc.invalidateQueries({ queryKey: ['c-vote', commentId, userId] })
      qc.invalidateQueries({ queryKey: ['c-vote-counts', commentId] })
      qc.invalidateQueries({ queryKey: ['c-vote-details', commentId] })
      qc.invalidateQueries({ queryKey: ['c-activity-count', commentId] })
    },
  })
}
