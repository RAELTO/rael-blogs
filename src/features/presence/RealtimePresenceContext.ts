import { createContext, use } from 'react'

export interface RealtimePresenceSnapshot {
  online: boolean
  visible: boolean
  onlineAt: string | null
  lastActiveAt: string | null
  connections: number
}

export interface RealtimePresenceContextValue {
  ready: boolean
  users: Record<string, RealtimePresenceSnapshot>
}

export const RealtimePresenceContext = createContext<RealtimePresenceContextValue>({
  ready: false,
  users: {},
})

export function useRealtimePresenceState() {
  return use(RealtimePresenceContext)
}
