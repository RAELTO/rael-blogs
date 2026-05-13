import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function useCommentActivityUserCount(commentId: string) {
  return useQuery({
    queryKey: ['c-activity-count', commentId],
    queryFn: async () => {
      const [votesRes, reactionsRes] = await Promise.all([
        supabase
          .from('comment_votes')
          .select('user_id')
          .eq('comment_id', commentId),
        supabase
          .from('comment_reactions')
          .select('user_id')
          .eq('comment_id', commentId),
      ])

      if (votesRes.error) throw votesRes.error
      if (reactionsRes.error) throw reactionsRes.error

      const userIds = new Set<string>()
      for (const vote of votesRes.data ?? []) userIds.add(vote.user_id)
      for (const reaction of reactionsRes.data ?? []) userIds.add(reaction.user_id)

      return userIds.size
    },
    staleTime: 30_000,
  })
}
