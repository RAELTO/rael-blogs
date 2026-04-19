import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sanitizeText } from '../../lib/sanitize'

const AUTH_ERROR = 'Correo o contraseña incorrectos.'

export function useSignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: sanitizeText(email).toLowerCase().slice(0, 254),
      password,
    })

    if (authError) {
      setError(AUTH_ERROR)
      setLoading(false)
      return false
    }

    // Verificar ban antes de permitir acceso
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', data.user.id)
      .single()

    if (profile?.is_banned) {
      await supabase.auth.signOut()
      setError('Esta cuenta ha sido suspendida. Contacta al administrador.')
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }

  return { signIn, loading, error }
}
