import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { BoxWithAuthor } from '../../types/database'

export function useBox(boxId: string) {
  return useQuery({
    queryKey: ['box', boxId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boxes')
        .select(`
          *,
          author:profiles!boxes_author_id_fkey(id, username, display_name, avatar_url, role),
          tags:box_tags(tag:tags(id, name, slug)),
          reaction_count:box_reactions(count),
          comment_count:box_comments(count)
        `)
        .eq('id', boxId)
        .single()
      if (error) throw error
      return {
        ...data,
        tags: ((data.tags as { tag: unknown }[]) ?? []).map(t => t.tag),
        reaction_count: ((data.reaction_count as { count: number }[])?.[0]?.count) ?? 0,
        comment_count:  ((data.comment_count  as { count: number }[])?.[0]?.count) ?? 0,
      } as BoxWithAuthor
    },
    staleTime: 60_000,
  })
}
