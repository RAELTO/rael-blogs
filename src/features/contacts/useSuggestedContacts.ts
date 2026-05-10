import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/database'
import { useContactIds } from './useContacts'

export function useSuggestedContacts(userId: string | undefined) {
  const contactIds = useContactIds(userId)

  return useQuery({
    queryKey: ['suggested-contacts', userId, contactIds.size],
    queryFn: async () => {
      if (!userId) return []

      // Ids con solicitud pendiente/aceptada (en cualquier dirección)
      const { data: reqs } = await supabase
        .from('contact_requests')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .in('status', ['pending', 'accepted'])

      const excludeIds = new Set<string>(contactIds)
      excludeIds.add(userId)
      for (const r of reqs ?? []) {
        excludeIds.add(r.requester_id === userId ? r.addressee_id : r.requester_id)
      }

      // Prioridad: usuarios que siguen al usuario actual o que el usuario sigue
      const { data: followData } = await supabase
        .from('follows')
        .select('follower_id, following_id')
        .or(`follower_id.eq.${userId},following_id.eq.${userId}`)

      const relatedIds = new Set<string>()
      for (const f of followData ?? []) {
        const other = f.follower_id === userId ? f.following_id : f.follower_id
        if (!excludeIds.has(other)) relatedIds.add(other)
      }

      // Si hay relacionados, mostrarlos primero; si no, mostrar perfiles generales
      let profiles: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>[] = []

      if (relatedIds.size > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', [...relatedIds])
          .limit(12)
        profiles = data ?? []
      }

      // Completar hasta 12 con otros perfiles si quedan huecos
      if (profiles.length < 12) {
        const alreadyIds = [...excludeIds, ...profiles.map(p => p.id)]
        const { data: extra } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .not('id', 'in', `(${alreadyIds.join(',')})`)
          .limit(12 - profiles.length)
        profiles = [...profiles, ...(extra ?? [])]
      }

      return profiles
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}
