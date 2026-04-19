import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          ▒ cargando...
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
