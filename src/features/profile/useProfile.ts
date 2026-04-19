import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { sanitizeText } from '../../lib/sanitize'

export interface Profile {
  id: string
  display_name: string
  username: string
  bio: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  is_banned: boolean
}

export interface ProfileFormData {
  display_name: string
  username: string
  bio: string
  avatar_url: string
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, bio, avatar_url, role, is_banned')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, form }: { userId: string; form: ProfileFormData }) => {
      const USERNAME_RE = /^[a-z0-9_]{3,30}$/
      const cleanUsername = sanitizeText(form.username).toLowerCase().replace(/\s+/g, '_')

      if (!USERNAME_RE.test(cleanUsername)) {
        throw new Error('El usuario solo puede tener letras minúsculas, números y guiones bajos (3–30 caracteres).')
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: sanitizeText(form.display_name).slice(0, 100),
          username: cleanUsername,
          bio: sanitizeText(form.bio).slice(0, 500) || null,
          avatar_url: sanitizeText(form.avatar_url).slice(0, 500) || null,
        })
        .eq('id', userId)

      if (error) {
        if (error.code === '23505') throw new Error('Ese nombre de usuario ya está en uso.')
        throw new Error('No se pudo actualizar el perfil.')
      }
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}
