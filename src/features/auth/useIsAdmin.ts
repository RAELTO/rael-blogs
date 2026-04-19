import { useAuth } from './AuthContext'
import { useProfile } from '../profile/useProfile'

export function useIsAdmin(): boolean {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  return profile?.role === 'admin'
}
