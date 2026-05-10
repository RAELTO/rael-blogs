import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthContext'

/**
 * Propietario único del canal Realtime de notificaciones.
 * Montado una sola vez en App.tsx para evitar conflictos de canal duplicado.
 */
export default function NotifNotifier() {
  const { user } = useAuth()
  const qc = useQueryClient()

  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`notif-notifier:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ['notifications', user.id] })
        qc.invalidateQueries({ queryKey: ['notif-count', user.id] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, qc])

  return null
}
