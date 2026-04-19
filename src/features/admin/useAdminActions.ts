import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function useBanUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, ban }: { userId: string; ban: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: ban })
        .eq('id', userId)
      if (error) throw new Error('No se pudo actualizar el estado del usuario.')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts', 'author'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useAdminDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw new Error('No se pudo eliminar el post.')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
