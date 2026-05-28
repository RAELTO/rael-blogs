import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { useContacts } from '../contacts/useContacts'
import {
  RealtimePresenceContext,
  type RealtimePresenceContextValue,
  type RealtimePresenceSnapshot,
} from './RealtimePresenceContext'

interface PresencePayload {
  user_id: string
  online_at: string
  last_active_at: string
  visible: boolean
}

function isPresencePayload(value: unknown): value is PresencePayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<PresencePayload>
  return typeof payload.user_id === 'string'
}

function latestString(values: Array<string | null | undefined>) {
  const sorted = values
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  return sorted[0] ?? null
}

function normalizePresenceState(state: Record<string, unknown[]>): Record<string, RealtimePresenceSnapshot> {
  const users: Record<string, RealtimePresenceSnapshot> = {}

  for (const [key, presences] of Object.entries(state)) {
    const payloads = presences.filter(isPresencePayload)
    const userId = payloads[0]?.user_id ?? key
    if (!userId) continue

    users[userId] = {
      online: payloads.length > 0,
      visible: payloads.some(payload => payload.visible),
      onlineAt: latestString(payloads.map(payload => payload.online_at)),
      lastActiveAt: latestString(payloads.map(payload => payload.last_active_at)),
      connections: payloads.length,
    }
  }

  return users
}

function mergePresenceSnapshots(
  current: RealtimePresenceSnapshot | undefined,
  next: RealtimePresenceSnapshot,
): RealtimePresenceSnapshot {
  return {
    online: Boolean(current?.online || next.online),
    visible: Boolean(current?.visible || next.visible),
    onlineAt: latestString([current?.onlineAt, next.onlineAt]),
    lastActiveAt: latestString([current?.lastActiveAt, next.lastActiveAt]),
    connections: (current?.connections ?? 0) + next.connections,
  }
}

function pairChannelName(a: string, b: string) {
  const [first, second] = [a, b].sort()
  return `presence:contact:${first}:${second}`
}

function buildPayload(userId: string): PresencePayload {
  const now = new Date().toISOString()
  return {
    user_id: userId,
    online_at: now,
    last_active_at: now,
    visible: typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  }
}

export function RealtimePresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { data: contacts } = useContacts(user?.id)
  const contactIds = useMemo(
    () => [...new Set((contacts ?? []).map(contact => contact.other.id))].toSorted(),
    [contacts],
  )
  const contactIdsKey = contactIds.join(',')
  const [value, setValue] = useState<RealtimePresenceContextValue>({ ready: false, users: {} })

  useEffect(() => {
    if (!user?.id || contactIds.length === 0) {
      return
    }

    const channels: RealtimeChannel[] = []
    let disposed = false

    const syncPresence = () => {
      if (disposed) return
      const users: Record<string, RealtimePresenceSnapshot> = {}

      for (const channel of channels) {
        const state = channel.presenceState() as Record<string, unknown[]>
        const channelUsers = normalizePresenceState(state)
        for (const [userId, snapshot] of Object.entries(channelUsers)) {
          users[userId] = mergePresenceSnapshots(users[userId], snapshot)
        }
      }

      setValue({ ready: true, users })
    }

    const trackPresence = async () => {
      if (disposed) return
      await Promise.all(channels.map(async channel => {
        const status = await channel.track(buildPayload(user.id))
        if (status === 'error' && import.meta.env.DEV) {
          console.warn('[presence] Could not publish realtime status')
        }
      }))
    }

    for (const contactId of contactIds) {
      const channel = supabase.channel(pairChannelName(user.id, contactId), {
        config: { presence: { key: user.id } },
      })

      channel
        .on('presence', { event: 'sync' }, syncPresence)
        .on('presence', { event: 'join' }, syncPresence)
        .on('presence', { event: 'leave' }, syncPresence)
        .subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            const trackStatus = await channel.track(buildPayload(user.id))
            if (trackStatus === 'error' && import.meta.env.DEV) {
              console.warn('[presence] Could not publish realtime status')
            }
            syncPresence()
          }
        })

      channels.push(channel)
    }

    if (channels.length === 0) {
      return
    }

    const onVisibilityChange = () => {
      void trackPresence()
    }
    const onFocus = () => {
      void trackPresence()
    }
    const interval = window.setInterval(() => {
      void trackPresence()
    }, 60_000)

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', onFocus)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', onFocus)
      window.clearInterval(interval)
      for (const channel of channels) {
        void channel.untrack()
        void supabase.removeChannel(channel)
      }
      setValue({ ready: false, users: {} })
    }
  }, [contactIds, contactIdsKey, user?.id])

  const contextValue = useMemo(() => value, [value])

  return (
    <RealtimePresenceContext.Provider value={contextValue}>
      {children}
    </RealtimePresenceContext.Provider>
  )
}
