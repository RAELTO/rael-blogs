import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type PresenceStatus = 'active' | 'away' | 'offline'

export interface PresenceInfo {
  status: PresenceStatus
  label: string    // '● ACTIVO' | '● hace 5m' | '' — texto en el header de chat
  color: string    // color del texto de estado
  dotColor: string // color del cuadrado indicador — SIEMPRE presente (verde=online, rojo=offline)
}

function compute(lastSeen: string | null | undefined): PresenceInfo {
  if (!lastSeen) return {
    status: 'offline', label: '',
    color: 'var(--ink-mute)', dotColor: '#ff5a5f',
  }

  const diff = Date.now() - new Date(lastSeen).getTime()
  const min  = Math.floor(diff / 60_000)

  if (min < 3) return {
    status: 'active', label: '● ACTIVO',
    color: 'var(--accent-4)', dotColor: '#6ee7b7',  // verde fijo — no cambia con temas
  }
  if (min < 60) return {
    status: 'away', label: `● hace ${min}m`,
    color: 'var(--ink-mute)', dotColor: '#ff5a5f',  // rojo fijo
  }
  const h = Math.floor(min / 60)
  if (h < 24) return {
    status: 'away', label: `● hace ${h}h`,
    color: 'var(--ink-mute)', dotColor: '#ff5a5f',
  }
  return {
    status: 'offline', label: '',
    color: 'var(--ink-mute)', dotColor: '#ff5a5f',
  }
}

// Un solo usuario
export function usePresence(userId: string | undefined): PresenceInfo {
  const { data } = useQuery({
    queryKey: ['presence', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('last_seen_at')
        .eq('id', userId!)
        .single()
      return data?.last_seen_at ?? null
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
  return compute(data)
}

// Múltiples usuarios (para listas: inbox, contactos, sidebar)
export function usePresenceMap(userIds: string[]): Record<string, PresenceInfo> {
  const key = [...userIds].sort().join(',')
  const { data } = useQuery({
    queryKey: ['presence-map', key],
    queryFn: async () => {
      if (!userIds.length) return []
      const { data } = await supabase
        .from('profiles')
        .select('id, last_seen_at')
        .in('id', userIds)
      return data ?? []
    },
    enabled: userIds.length > 0,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const map: Record<string, PresenceInfo> = {}
  for (const p of data ?? []) map[p.id] = compute(p.last_seen_at)
  return map
}
