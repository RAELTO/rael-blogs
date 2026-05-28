import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useSendRecovery() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const send = async (email: string) => {
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    // oo revelar si el correo existe o no (evita enumeración)
    if (err) console.warn('recovery error (suppressed)', err.message)
    setSent(true)
    setLoading(false)
  }

  const reset = () => { setSent(false); setError(null) }

  return { send, loading, sent, error, reset }
}

export function useUpdatePassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const update = async (password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError('Could not update the password. The link may have expired.')
      setLoading(false)
      return false
    }
    setLoading(false)
    return true
  }

  return { update, loading, error }
}
