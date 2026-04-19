import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useMyBookmarks } from '../../features/interactions/useBookmarks'
import AppLayout from '../../components/layout/AppLayout'
import PostCard from '../../components/posts/PostCard'

export default function BookmarksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: posts = [], isLoading } = useMyBookmarks(user?.id)

  return (
    <AppLayout>
      <div className="page">
        <button className="btn btn-ghost mb-5" onClick={() => navigate('/dashboard')}>
          ← Volver al panel
        </button>

        <div className="mb-6">
          <div className="hero-eyebrow" style={{ marginBottom: 12 }}>★ tus favoritos</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '8px 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ background: 'var(--accent-2)', border: '3px solid var(--ink)', padding: '0 12px', boxShadow: '5px 5px 0 var(--ink)', display: 'inline-block' }}>
              Guardados
            </span>
          </h1>
        </div>

        {isLoading && (
          <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
            ▒ cargando favoritos...
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>— Sin favoritos aún —</div>
            <div className="text-mute mt-3" style={{ fontSize: 14 }}>
              Guarda posts con ☆ desde cualquier publicación.
            </div>
            <button className="btn mt-5" onClick={() => navigate('/')}>Explorar posts</button>
          </div>
        )}

        {posts.length > 0 && (
          <div className="feed-grid">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
