import { useNavigate } from 'react-router-dom'
import { useCategories } from '../../features/categories/useCategories'
import { usePosts } from '../../features/posts/usePosts'
import { formatDate, readTime } from '../../lib/utils'
import AppLayout from '../../components/layout/AppLayout'
import Chip from '../../components/ui/Chip'
import Icon from '../../components/ui/Icon'

const CHIP_COLORS: Array<'pink' | 'cyan' | 'purple'> = ['cyan', 'purple', 'pink', 'purple', 'cyan', 'pink']

export default function CategoriesPage() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading } = useCategories()
  const { data: posts = [] } = usePosts()

  const countFor = (catId: string) =>
    posts.filter(p => p.categories.some(c => c.id === catId)).length

  const topPostsFor = (catId: string) =>
    posts.filter(p => p.categories.some(c => c.id === catId)).slice(0, 3)

  return (
    <AppLayout>
      <div className="page">
        {/* Cabecera */}
        <div className="mb-6">
          <div className="hero-eyebrow" style={{ marginBottom: 16 }}>▓ explorar</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, margin: '10px 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ background: 'var(--accent-1)', border: '3px solid var(--ink)', padding: '0 12px', boxShadow: '5px 5px 0 var(--ink)', display: 'inline-block' }}>
              Categorías
            </span>
          </h1>
          <p style={{ maxWidth: 600, fontSize: 16, color: 'var(--ink-dim)', marginTop: 16, lineHeight: 1.6 }}>
            Seis canales afinados a la misma frecuencia: narrativa, análisis y un poco de ruido editorial.
          </p>
        </div>

        {isLoading && (
          <div className="panel" style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ▒ cargando...
          </div>
        )}

        {/* Grid de categorías */}
        {!isLoading && (
          <div className="cat-grid mb-6">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="cat-tile"
                onClick={() => navigate(`/category/${cat.slug}`)}
              >
                <div className="cat-name">▸ {cat.name}</div>
                <div className="cat-count">{countFor(cat.id)} publicaciones</div>
                {cat.description && (
                  <div className="cat-desc">{cat.description}</div>
                )}
                <div className="row gap-2 mt-4">
                  <Chip color={CHIP_COLORS[i % 6]}>{cat.name}</Chip>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lo más leído por canal */}
        <h2 className="section-title mb-5">▸ Lo más leído por canal</h2>

        {!isLoading && categories.every(cat => topPostsFor(cat.id).length === 0) && (
          <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.02em', marginBottom: 12 }}>
              ▒ Sin señal aún ▒
            </div>
            <div style={{ fontSize: 15, color: 'var(--ink-dim)', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
              Los canales están en stand-by. Publica el primer post y aparecerá aquí como emisión en vivo.
            </div>
          </div>
        )}

        {categories.map(cat => {
          const catPosts = topPostsFor(cat.id)
          if (!catPosts.length) return null
          return (
            <div key={cat.id} className="mb-6">
              <div className="row between items-center mb-3">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.01em' }}>
                  ◍ {cat.name}
                </div>
                <button className="btn btn-small" onClick={() => navigate(`/category/${cat.slug}`)}>
                  Ver todas <Icon name="arrowRight" size={12} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {catPosts.map(p => (
                  <div
                    key={p.id}
                    className="panel"
                    style={{ padding: 16, cursor: 'pointer' }}
                    onClick={() => navigate(`/post/${p.slug}`)}
                  >
                    <div className="text-xs text-mute uppercase mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatDate(p.published_at ?? p.created_at)} · {readTime(p.content)} min
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                      {p.title}
                    </div>
                    <div className="row gap-3 mt-4 text-xs text-mute">
                      <span>@{p.author.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {!isLoading && categories.length === 0 && (
          <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Sin categorías aún</div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
