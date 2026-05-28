import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sanitizeText } from '../../lib/sanitize'

const USERNAME_RE = /^[a-z0-9_]{3,30}$/

export function useSignUp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    setLoading(true)
    setError(null)

    const cleanUsername = sanitizeText(username).toLowerCase().replace(/\s+/g, '_')
    const cleanDisplayName = sanitizeText(displayName).slice(0, 100)

    if (!USERNAME_RE.test(cleanUsername)) {
      setError('Usernames can only use lowercase letters, numbers, and underscores (3-30 characters).')
      setLoading(false)
      return false
    }

    // Check username availability before creating auth user
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (existing) {
      setError('That username is already taken. Choose another one.')
      setLoading(false)
      return false
    }

    const { error } = await supabase.auth.signUp({
      email: sanitizeText(email).toLowerCase().slice(0, 254),
      password,
      options: {
        data: {
          display_name: cleanDisplayName,
          username: cleanUsername,
        },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.code === 'email_address_in_use') {
        setError('This email already has a registered account.')
      } else {
        setError('Could not create the account. Try again.')
      }
    }
    setLoading(false)
    return !error
  }

  const reset = () => setError(null)
  return { signUp, loading, error, reset }
}
