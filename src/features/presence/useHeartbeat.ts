import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const INTERVAL_MS = 60_000 // actualizar last_seen_at cada 60s

export function useHeartbeat(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return

    const ping = () =>
      supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId)

    ping() // inmediatamente al montar
    const timer = setInterval(ping, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [userId])
}
