import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

function useTrendingTags() {
  return useQuery({
    queryKey: ['trending-tags'],
    queryFn: async () => {
      const { data } = await supabase
        .from('box_tags')
        .select('tag:tags(id, name, slug)')
        .limit(100)
      const counts: Record<string, { id: string; name: string; slug: string; count: number }> = {}
      for (const row of data ?? []) {
        const t = row.tag as { id: string; name: string; slug: string } | null
        if (!t) continue
        if (!counts[t.id]) counts[t.id] = { ...t, count: 0 }
        counts[t.id].count++
      }
      return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10)
    },
    staleTime: 60_000,
  })
}

interface Props {
  onClose: () => void
}

export default function MobileSearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: tags = [] } = useTrendingTags()

  useEffect(() => {
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) { navigate(`/explore?q=${encodeURIComponent(q)}`); onClose() }
  }

  function handleTag(slug: string) {
    navigate(`/tag/${slug}`)
    onClose()
  }

  return createPortal(
    <div className="mob-search-overlay">
      {/* Input row */}
      <div className="mob-search-header">
        <button className="mob-search-back" onClick={onClose} type="button">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <form onSubmit={handleSubmit} style={{ flex: 1, position: 'relative', display: 'flex' }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--ink-mute)', display: 'flex', zIndex: 1,
          }}>
            <Search size={16} strokeWidth={2.5} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar en NBOX"
            style={{ paddingLeft: 36, height: 44, width: '100%' }}
          />
        </form>
      </div>

      {/* Trending tags */}
      <div className="mob-search-body">
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '.06em',
          color: 'var(--ink-mute)', marginBottom: 12,
        }}>
          🔥 Tendencias
        </div>

        {tags.map(t => (
          <button
            key={t.id}
            type="button"
            className="mob-search-tag-row"
            onClick={() => handleTag(t.slug)}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>#{t.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', fontWeight: 700 }}>
              {t.count}
            </span>
          </button>
        ))}

        {tags.length === 0 && (
          <div style={{ color: 'var(--ink-mute)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '8px 0' }}>
            Sin tendencias aún
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
