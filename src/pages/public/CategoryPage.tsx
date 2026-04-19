import { useParams, useNavigate } from 'react-router-dom'
import { usePostsByCategory } from '../../features/posts/usePostsByCategory'
import { useCategories } from '../../features/categories/useCategories'
import PostCard from '../../components/posts/PostCard'
import AppLayout from '../../components/layout/AppLayout'

export default function CategoryPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { data: posts = [], isLoading } = usePostsByCategory(slug)
  const { data: categories = [] } = useCategories()

  const category = categories.find(c => c.slug === slug)

  return (
    <AppLayout>
      <div className="page">
        <button className="btn btn-ghost mb-4" onClick={() => navigate('/categories')}>
          ← Todas las categorías
        </button>

        <div className="mb-6">
          <div className="hero-eyebrow" style={{ marginBottom: 12 }}>▓ categoría</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, margin: '8px 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ background: 'var(--accent-1)', border: '3px solid var(--ink)', padding: '0 12px', boxShadow: '5px 5px 0 var(--ink)', display: 'inline-block' }}>
              {category?.name ?? slug}
            </span>
          </h1>
          {category?.description && (
            <p style={{ maxWidth: 600, fontSize: 16, color: 'var(--ink-dim)', marginTop: 14, lineHeight: 1.6 }}>
              {category.description}
            </p>
          )}
        </div>

        {isLoading && (
          <div className="panel" style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ▒ cargando...
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>— Sin publicaciones en esta categoría —</div>
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
