import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const INTERVAL_MS = 60_000

export function useHeartbeat(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return

    const ping = async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId)

      if (error && import.meta.env.DEV) {
        console.warn('[presence] No se pudo actualizar last_seen_at', error)
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void ping()
    }

    void ping()
    const timer = window.setInterval(() => {
      void ping()
    }, INTERVAL_MS)

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [userId])
}
