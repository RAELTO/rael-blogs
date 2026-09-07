import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type ShareType = 'feed' | 'whatsapp' | 'link' | 'contact' | 'group'

export function useShareCount(boxId: string, enabled = true) {
  return useQuery({
    queryKey: ['shares', boxId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('box_shares')
        .select('*', { count: 'exact', head: true })
        .eq('box_id', boxId)
      if (error) throw error
      return count ?? 0
    },
    enabled,
    staleTime: 60_000,
  })
}

export function useRecordShare(boxId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, shareType }: { userId: string; shareType: ShareType }) => {
      const { error } = await supabase.from('box_shares').insert({ box_id: boxId, user_id: userId, share_type: shareType })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shares', boxId] })
      qc.invalidateQueries({ queryKey: ['box-engagement'] })
    },
  })
}
