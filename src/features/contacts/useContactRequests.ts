import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/database'

export interface ContactRequestRow {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined' | 'canceled'
  created_at: string
  responded_at: string | null
  requester: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  addressee: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

const SELECT = `
  *,
  requester:profiles!contact_requests_requester_id_fkey(id, username, display_name, avatar_url),
  addressee:profiles!contact_requests_addressee_id_fkey(id, username, display_name, avatar_url)
`

export function useIncomingRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ['contact-requests', 'incoming', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('contact_requests')
        .select(SELECT)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as ContactRequestRow[]
    },
    enabled: !!userId,
    staleTime: 20_000,
  })
}

export function useOutgoingRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ['contact-requests', 'outgoing', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('contact_requests')
        .select(SELECT)
        .eq('requester_id', userId)
        .in('status', ['pending', 'accepted', 'declined'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as ContactRequestRow[]
    },
    enabled: !!userId,
    staleTime: 20_000,
  })
}

export function useContactStatus(userId: string | undefined, otherId: string | undefined) {
  return useQuery({
    queryKey: ['contact-status', userId, otherId],
    queryFn: async () => {
      if (!userId || !otherId) return 'none' as const

      const [userA, userB] = [userId, otherId].sort()
      const [reqRes, contactRes] = await Promise.all([
        supabase
          .from('contact_requests')
          .select('requester_id, status')
          .or(`and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId})`)
          .in('status', ['pending', 'accepted', 'declined'])
          .maybeSingle(),
        supabase
          .from('contacts')
          .select('user_a')
          .or(`and(user_a.eq.${userA},user_b.eq.${userB})`)
          .maybeSingle(),
      ])

      if (contactRes.data) return 'contacts' as const
      if (!reqRes.data) return 'none' as const

      const req = reqRes.data
      if (req.status === 'accepted') return 'contacts' as const
      if (req.status === 'declined') return 'none' as const
      if (req.requester_id === userId) return 'pending_sent' as const
      return 'pending_received' as const
    },
    enabled: !!userId && !!otherId,
    staleTime: 15_000,
  })
}
