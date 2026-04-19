import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePostsFeed } from '../../features/posts/usePostsFeed'
import PostCard from '../../components/posts/PostCard'
import AppLayout from '../../components/layout/AppLayout'
import Chip from '../../components/ui/Chip'
import Icon from '../../components/ui/Icon'

function Hero({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="hero">
      <div className="hero-grid-bg" />
      <div className="hero-sun" />
      <div className="hero-inner">
        <div className="hero-eyebrow">▓ RAEL'S BLOGS · en vivo</div>
        <h1 className="hero-title">
          <span className="mark">RAEL'S</span> blogs.
        </h1>
        <p className="hero-subtitle">
          Un blog sobre narrativas digitales y multimedia. Desmontamos argumentos,
          mapeamos hipervínculos y chequeamos la lógica de lo que miramos — sin
          filtros, directo al grano.
        </p>
        <div className="row gap-3 wrap">
          <button className="btn btn-primary" onClick={onExplore}><Icon name="bolt" size={14} /> Explorar categorías</button>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostsFeed()
  const [q, setQ] = useState('')
  const [activeCat, setActiveCat] = useState<string | null>(null)

  const allPosts = useMemo(() => data?.pages.flat() ?? [], [data])

  const allCategories = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; slug: string }>()
    allPosts.forEach(p => p.categories.forEach(c => seen.set(c.id, c)))
    return [...seen.values()]
  }, [allPosts])

  const filtered = useMemo(() => {
    return allPosts.filter(p => {
      if (activeCat && !p.categories.some(c => c.id === activeCat)) return false
      if (q) {
        const needle = q.toLowerCase()
        const hay = [p.title, p.excerpt ?? '', p.author.display_name, ...p.tags.map(t => t.name)].join(' ').toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [allPosts, q, activeCat])

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <AppLayout>
      <Hero onExplore={() => navigate('/categories')} />

      <div className="page" style={{ paddingTop: 0 }}>
        {/* Filtros */}
        <div className="row between items-center wrap gap-4 mb-5">
          <div style={{ position: 'relative', width: 360, maxWidth: '100%' }}>
            <input
              placeholder="Buscar publicaciones, tags, autores…"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>⌕</span>
          </div>
          <div className="row gap-2 wrap">
            <Chip onClick={() => setActiveCat(null)} active={activeCat === null}>Todas</Chip>
            {allCategories.map(c => (
              <Chip key={c.id} color="pink" onClick={() => setActiveCat(activeCat === c.id ? null : c.id)} active={activeCat === c.id}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="spinner">
            <div className="spinner-ring" />
            <span className="spinner-label">▒ cargando posts...</span>
          </div>
        )}

        {isError && (
          <div className="panel" style={{ padding: 40, textAlign: 'center', color: 'var(--accent-1)', fontWeight: 700 }}>
            ⚠ Error cargando publicaciones. Intenta de nuevo.
          </div>
        )}

        {!isLoading && !isError && allPosts.length === 0 && (
          <div className="panel" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.02em', marginBottom: 12 }}>
              ▒ Sin emisión aún ▒
            </div>
            <div style={{ fontSize: 15, color: 'var(--ink-mute)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
              El feed está en stand-by. Publica el primer post y aparecerá aquí.
            </div>
          </div>
        )}

        {!isLoading && !isError && allPosts.length > 0 && filtered.length === 0 && (q || activeCat) && (
          <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>— Sin resultados —</div>
            <div className="text-mute mt-3">No hay publicaciones que encajen con tu búsqueda.</div>
          </div>
        )}

        {featured && (
          <>
            <h2 className="section-title">▸ Destacada</h2>
            <div className="feed-grid mb-6">
              <PostCard post={featured} featured />
            </div>
          </>
        )}

        {rest.length > 0 && (
          <>
            <h2 className="section-title">▸ Más del feed</h2>
            <div className="feed-grid">
              {rest.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          </>
        )}

        {/* Cargar más */}
        {hasNextPage && !q && !activeCat && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <button
              className="btn btn-primary"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              style={{ minWidth: 160 }}
            >
              {isFetchingNextPage
                ? <><div className="spinner-ring" style={{ width: 14, height: 14, borderWidth: 2 }} /> Cargando…</>
                : '▸ Cargar más'}
            </button>
          </div>
        )}

        {!hasNextPage && allPosts.length >= 9 && !q && !activeCat && (
          <div style={{ textAlign: 'center', marginTop: 40, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', color: 'var(--ink-mute)', textTransform: 'uppercase' }}>
            ▒ Has llegado al final del feed ▒
          </div>
        )}
      </div>
    </AppLayout>
  )
}
