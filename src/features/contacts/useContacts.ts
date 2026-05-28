import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/database'

export interface ContactWithProfile {
  user_a: string
  user_b: string
  created_at: string
  profile_a: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  profile_b: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  // Helper: the other user's profile (not the current user)
  other: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

export function useContacts(userId: string | undefined) {
  return useQuery({
    queryKey: ['contacts', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          profile_a:profiles!contacts_user_a_fkey(id, username, display_name, avatar_url),
          profile_b:profiles!contacts_user_b_fkey(id, username, display_name, avatar_url)
        `)
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order('created_at', { ascending: false })
      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => ({
        ...row,
        other: row.user_a === userId ? row.profile_b : row.profile_a,
      })) as ContactWithProfile[]
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}

// Current user contact IDs for filtering suggestions, etc.
export function useContactIds(userId: string | undefined): Set<string> {
  const { data = [] } = useContacts(userId)
  return new Set(data.map(c => c.other.id))
}
