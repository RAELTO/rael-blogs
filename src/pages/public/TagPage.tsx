import { useParams, useNavigate } from 'react-router-dom'
import { usePostsByTag } from '../../features/posts/usePostsByTag'
import PostCard from '../../components/posts/PostCard'
import AppLayout from '../../components/layout/AppLayout'

export default function TagPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { data: posts = [], isLoading } = usePostsByTag(slug)

  return (
    <AppLayout>
      <div className="page">
        <button className="btn btn-ghost mb-4" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <div className="mb-6">
          <div className="hero-eyebrow" style={{ marginBottom: 12 }}>▓ etiqueta</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, margin: '8px 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ background: 'var(--accent-3)', border: '3px solid var(--ink)', padding: '0 12px', boxShadow: '5px 5px 0 var(--ink)', display: 'inline-block' }}>
              #{slug}
            </span>
          </h1>
        </div>

        {isLoading && (
          <div className="panel" style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ▒ cargando...
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>— Sin publicaciones con este tag —</div>
            <button className="btn mt-4" onClick={() => navigate('/')}>← Volver al feed</button>
          </div>
        )}

        {posts.length > 0 && (
          <>
            <div className="section-title">▸ {posts.length} publicación{posts.length !== 1 ? 'es' : ''}</div>
            <div className="feed-grid mt-4">
              {posts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
