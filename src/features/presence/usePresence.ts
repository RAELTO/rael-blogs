import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useRealtimePresenceState, type RealtimePresenceSnapshot } from './RealtimePresenceContext'

export type PresenceStatus = 'active' | 'away' | 'offline'

export interface PresenceInfo {
  status: PresenceStatus
  label: string
  color: string
  dotColor: string
}

const ACTIVE_DOT = '#6ee7b7'
const OFFLINE_DOT = '#ff5a5f'

function active(): PresenceInfo {
  return {
    status: 'active',
    label: 'ACTIVE',
    color: 'var(--accent-4)',
    dotColor: ACTIVE_DOT,
  }
}

function offline(label = ''): PresenceInfo {
  return {
    status: 'offline',
    label,
    color: 'var(--ink-mute)',
    dotColor: OFFLINE_DOT,
  }
}

function away(label: string): PresenceInfo {
  return {
    status: 'away',
    label,
    color: 'var(--ink-mute)',
    dotColor: OFFLINE_DOT,
  }
}

function compute(
  lastSeen: string | null | undefined,
  realtime: RealtimePresenceSnapshot | undefined,
  realtimeReady: boolean,
): PresenceInfo {
  if (realtime?.online) return active()

  if (!lastSeen) return offline()

  const diff = Date.now() - new Date(lastSeen).getTime()
  const min = Math.floor(diff / 60_000)

  if (!realtimeReady && min < 3) return active()
  if (min < 60) return away(`${Math.max(1, min)}m ago`)

  const h = Math.floor(min / 60)
  if (h < 24) return away(`${h}h ago`)

  return offline()
}

export function usePresence(userId: string | undefined): PresenceInfo {
  const realtime = useRealtimePresenceState()
  const { data } = useQuery({
    queryKey: ['presence', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('last_seen_at')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data?.last_seen_at ?? null
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  if (!userId) return offline()
  return compute(data, realtime.users[userId], realtime.ready)
}

export function usePresenceMap(userIds: string[]): Record<string, PresenceInfo> {
  const realtime = useRealtimePresenceState()
  const key = userIds.toSorted().join(',')
  const { data } = useQuery({
    queryKey: ['presence-map', key],
    queryFn: async () => {
      if (!userIds.length) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('id, last_seen_at')
        .in('id', userIds)
      if (error) throw error
      return data ?? []
    },
    enabled: userIds.length > 0,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const lastSeenById = new Map((data ?? []).map(profile => [profile.id, profile.last_seen_at]))
  const map: Record<string, PresenceInfo> = {}
  for (const id of userIds) {
    map[id] = compute(lastSeenById.get(id), realtime.users[id], realtime.ready)
  }
  return map
}
