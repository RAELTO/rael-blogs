import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

export default function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
          Loading…
        </div>
      </div>
    )
  }

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return <Outlet />
}
