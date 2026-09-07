import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ReactionType } from '../../types/database'

export function useMyReaction(boxId: string, userId?: string, enabled = true) {
  return useQuery({
    queryKey: ['reaction', boxId, userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('box_reactions')
        .select('reaction_type')
        .eq('box_id', boxId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return (data?.reaction_type ?? null) as ReactionType | null
    },
    enabled: enabled && !!userId,
    staleTime: 60_000,
  })
}

export function useReactionCounts(boxId: string, enabled = true) {
  return useQuery({
    queryKey: ['reaction-counts', boxId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('box_reactions')
        .select('reaction_type')
        .eq('box_id', boxId)
      if (error) throw error
      const counts: Record<ReactionType, number> = { bold: 0, loud: 0, fire: 0, sharp: 0, save: 0, angry: 0 }
      for (const row of data ?? []) counts[row.reaction_type as ReactionType]++
      return counts
    },
    enabled,
    staleTime: 30_000,
  })
}

export interface ReactionDetailRow {
  reaction_type: ReactionType
  user_id: string
  profiles: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
}

export function useReactionDetails(boxId: string, enabled = false) {
  return useQuery({
    queryKey: ['reaction-details', boxId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('box_reactions')
        .select('reaction_type, user_id, profiles(id, username, display_name, avatar_url, role)')
        .eq('box_id', boxId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as ReactionDetailRow[]
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useToggleReaction(boxId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, type, current }: { userId: string; type: ReactionType; current: ReactionType | null }) => {
      if (current === type) {
        const { error } = await supabase.from('box_reactions').delete().eq('box_id', boxId).eq('user_id', userId)
        if (error) throw error
      } else if (current) {
        const { error } = await supabase.from('box_reactions').update({ reaction_type: type }).eq('box_id', boxId).eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('box_reactions').insert({ box_id: boxId, user_id: userId, reaction_type: type })
        if (error) throw error
      }
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['reaction', boxId, userId] })
      qc.invalidateQueries({ queryKey: ['reaction-counts', boxId] })
      qc.invalidateQueries({ queryKey: ['reaction-details', boxId] })
      qc.invalidateQueries({ queryKey: ['boxes', 'feed'] })
      qc.invalidateQueries({ queryKey: ['box-engagement'] })
    },
  })
}
