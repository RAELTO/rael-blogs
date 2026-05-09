import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { VoteType } from '../../types/database'

export function useMyVote(boxId: string, userId?: string) {
  return useQuery({
    queryKey: ['vote', boxId, userId],
    queryFn: async () => {
      if (!userId) return null
      const { data } = await supabase
        .from('box_votes')
        .select('vote')
        .eq('box_id', boxId)
        .eq('user_id', userId)
        .maybeSingle()
      return (data?.vote ?? null) as VoteType | null
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}

export function useVoteCounts(boxId: string) {
  return useQuery({
    queryKey: ['vote-counts', boxId],
    queryFn: async () => {
      const { data } = await supabase
        .from('box_votes')
        .select('vote')
        .eq('box_id', boxId)
      const counts = { like: 0, dislike: 0 }
      for (const row of data ?? []) counts[row.vote as VoteType]++
      return counts
    },
    staleTime: 30_000,
  })
}

export interface VoteDetailRow {
  vote: VoteType
  user_id: string
  profiles: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
}

export function useVoteDetails(boxId: string, enabled = false) {
  return useQuery({
    queryKey: ['vote-details', boxId],
    queryFn: async () => {
      const { data } = await supabase
        .from('box_votes')
        .select('vote, user_id, profiles(id, username, display_name, avatar_url)')
        .eq('box_id', boxId)
        .order('created_at', { ascending: false })
      return (data ?? []) as VoteDetailRow[]
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useToggleVote(boxId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, vote, current }: { userId: string; vote: VoteType; current: VoteType | null }) => {
      if (current === vote) {
        await supabase.from('box_votes').delete().eq('box_id', boxId).eq('user_id', userId)
      } else if (current) {
        await supabase.from('box_votes').update({ vote }).eq('box_id', boxId).eq('user_id', userId)
      } else {
        await supabase.from('box_votes').insert({ box_id: boxId, user_id: userId, vote })
      }
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['vote', boxId, userId] })
      qc.invalidateQueries({ queryKey: ['vote-counts', boxId] })
      qc.invalidateQueries({ queryKey: ['vote-details', boxId] })
    },
  })
}
