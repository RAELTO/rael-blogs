import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function useGetOrCreateConversation(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (otherId: string): Promise<string> => {
      const [a, b] = [userId, otherId].sort()

      // Buscar conversación existente
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_a', a)
        .eq('user_b', b)
        .maybeSingle()

      if (existing) return existing.id

      // Crear nueva conversación
      const { data: created, error } = await supabase
        .from('conversations')
        .insert({ user_a: a, user_b: b })
        .select('id')
        .single()
      if (error) throw error

      // Crear participation rows para ambos usuarios
      await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: created.id, user_id: userId },
          { conversation_id: created.id, user_id: otherId },
        ])

      return created.id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations', userId] })
    },
  })
}
