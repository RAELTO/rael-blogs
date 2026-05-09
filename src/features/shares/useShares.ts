import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type ShareType = 'feed' | 'whatsapp' | 'link' | 'contact' | 'group'

export function useShareCount(boxId: string) {
  return useQuery({
    queryKey: ['shares', boxId],
    queryFn: async () => {
      const { count } = await supabase
        .from('box_shares')
        .select('*', { count: 'exact', head: true })
        .eq('box_id', boxId)
      return count ?? 0
    },
    staleTime: 60_000,
  })
}

export function useRecordShare(boxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, shareType }: { userId: string; shareType: ShareType }) => {
      await supabase.from('box_shares').insert({ box_id: boxId, user_id: userId, share_type: shareType })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shares', boxId] })
    },
  })
}
