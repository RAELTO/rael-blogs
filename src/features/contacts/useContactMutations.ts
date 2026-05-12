import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

function invalidateContacts(qc: ReturnType<typeof useQueryClient>, userId: string) {
  qc.invalidateQueries({ queryKey: ['contacts', userId] })
  qc.invalidateQueries({ queryKey: ['contact-requests'] })
  qc.invalidateQueries({ queryKey: ['contact-status'] })
  qc.invalidateQueries({ queryKey: ['suggested-contacts'] })
  qc.invalidateQueries({ queryKey: ['search-people'] })
}

// ── Enviar solicitud ──────────────────────────────────────────────────────────
export function useSendContactRequest(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      const { error } = await supabase
        .from('contact_requests')
        .insert({ requester_id: userId, addressee_id: addresseeId })
      if (error) throw error
    },
    onSuccess: () => invalidateContacts(qc, userId),
  })
}

// ── Cancelar solicitud enviada ────────────────────────────────────────────────
export function useCancelContactRequest(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: 'canceled' })
        .eq('id', requestId)
        .eq('requester_id', userId)
      if (error) throw error
    },
    onSuccess: () => invalidateContacts(qc, userId),
  })
}

// ── Responder solicitud recibida (aceptar / rechazar) ─────────────────────────
export function useRespondContactRequest(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      requestId,
      accept,
    }: {
      requestId: string
      requesterId: string
      accept: boolean
    }) => {
      if (accept) {
        // RPC atómica: actualiza contact_requests + inserta en contacts en una tx
        const { error } = await supabase.rpc('accept_contact_request', { p_request_id: requestId })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('contact_requests')
          .update({ status: 'declined', responded_at: new Date().toISOString() })
          .eq('id', requestId)
          .eq('addressee_id', userId)
        if (error) throw error
      }
    },
    onSuccess: () => invalidateContacts(qc, userId),
  })
}

// ── Eliminar contacto ─────────────────────────────────────────────────────────
export function useRemoveContact(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (otherId: string) => {
      const [a, b] = [userId, otherId].sort()
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('user_a', a)
        .eq('user_b', b)
      if (error) throw error
    },
    onSuccess: () => invalidateContacts(qc, userId),
  })
}
