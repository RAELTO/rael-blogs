import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export interface PollVoteSummary {
  counts: Record<number, number>
  selectedOption: number | null
}

export function usePollVotes(boxId: string, userId?: string, enabled = true) {
  return useQuery({
    queryKey: ['poll-votes', boxId, userId ?? null],
    queryFn: async (): Promise<PollVoteSummary> => {
      const { data, error } = await supabase
        .from('box_poll_votes')
        .select('user_id, option_index')
        .eq('box_id', boxId)
        .order('user_id')

      if (error) throw error

      const counts: Record<number, number> = {}
      let selectedOption: number | null = null

      for (const row of data ?? []) {
        counts[row.option_index] = (counts[row.option_index] ?? 0) + 1
        if (userId && row.user_id === userId) selectedOption = row.option_index
      }

      return { counts, selectedOption }
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useSelectPollOption(boxId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      optionIndex,
      current,
    }: {
      userId: string
      optionIndex: number
      current: number | null
    }) => {
      if (current === optionIndex) {
        const { error } = await supabase
          .from('box_poll_votes')
          .delete()
          .eq('box_id', boxId)
          .eq('user_id', userId)

        if (error) throw error
        return null
      }

      const { error } = await supabase
        .from('box_poll_votes')
        .upsert(
          { box_id: boxId, user_id: userId, option_index: optionIndex },
          { onConflict: 'box_id,user_id' },
        )

      if (error) throw error
      return optionIndex
    },
    onSuccess: (_selectedOption, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['poll-votes', boxId, userId] })
      queryClient.invalidateQueries({ queryKey: ['box-engagement'] })
    },
  })
}
