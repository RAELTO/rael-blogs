import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthContext'
import { useConversations, type ConversationRow } from '../../features/chat/useConversations'
import { useFloatingChat } from '../../features/chat/FloatingChatContext'
import { useToast } from '../ui/Toast'

/**
 * Escucha cambios en las conversaciones via Realtime.
 * Cuando llega un mensaje nuevo de otro usuario, abre el chat flotante.
 */
export default function MessageNotifier() {
  const { user }              = useAuth()
  const qc                    = useQueryClient()
  const { data: convs = [] }  = useConversations(user?.id)
  const { chats, openChat }   = useFloatingChat()
  const toast                 = useToast()
  const prevRef               = useRef<ConversationRow[]>([])
  const initializedRef        = useRef(false)

  // Realtime único — solo en MessageNotifier, evita conflicto de canales
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`msg-notifier:${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      }, () => {
        qc.invalidateQueries({ queryKey: ['conversations', user.id] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, qc])

  useEffect(() => {
    if (!user || convs.length === 0) return

    // Primera carga — solo guardar snapshot, no abrir nada
    if (!initializedRef.current) {
      prevRef.current = convs
      initializedRef.current = true
      return
    }

    const prev = prevRef.current

    for (const conv of convs) {
      const prevConv = prev.find(c => c.id === conv.id)

      const isNewMessage = !prevConv
        ? conv.has_unread
        : conv.last_message_at !== prevConv.last_message_at && conv.has_unread

      if (isNewMessage) {
        toast(`💬 Nuevo mensaje de ${conv.other.display_name}`, 4000)
        // En móvil solo mostramos el toast — el panel flotante no está disponible
        if (window.innerWidth > 760) {
          const alreadyOpen = chats.some(c => c.conversationId === conv.id)
          if (!alreadyOpen) {
            openChat({
              conversationId: conv.id,
              otherId:        conv.other.id,
              otherName:      conv.other.display_name,
              otherAvatar:    conv.other.avatar_url,
            })
          }
        }
      }
    }

    prevRef.current = convs
  }, [convs, user]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
