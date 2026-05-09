import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserPlus, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthContext'

type Profile = { id: string; username: string; display_name: string; avatar_url: string | null }

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
      return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 6)
    },
    staleTime: 60_000,
  })
}

function useSuggestedUsers() {
  return useQuery({
    queryKey: ['suggested-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .limit(6)
      return (data ?? []) as Profile[]
    },
    staleTime: 120_000,
  })
}

function NumFmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}

const AVATAR_COLORS = [
  'var(--accent-1)', 'var(--accent-3)', 'var(--accent-4)',
  'var(--accent-5)', 'var(--accent-2)',
]

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export default function RightSidebar() {
  const { user } = useAuth()
  const { data: tags } = useTrendingTags()
  const { data: allUsers } = useSuggestedUsers()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [followed, setFollowed]   = useState<Set<string>>(new Set())

  const suggestions = (allUsers ?? []).filter(u => !dismissed.has(u.id)).slice(0, 4)
  const contacts    = (allUsers ?? []).slice(0, 5)

  return (
    <>
      {/* Trending tags */}
      <div className="panel mb-4" style={{ padding: 14 }}>
        <div className="uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          🔥 Loud This Week
        </div>
        {(tags ?? []).map(t => (
          <div key={t.id} className="row between mb-2" style={{ cursor: 'pointer' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14 }}>#{t.name}</span>
            <span className="text-xs text-mute" style={{ fontFamily: 'var(--font-mono)' }}>
              {NumFmt(t.count)}
            </span>
          </div>
        ))}
        {(tags ?? []).length === 0 && (
          <div className="text-xs text-mute">Sin tags aún</div>
        )}
      </div>

      {/* Sugerencias y Contactos solo para usuarios logueados */}
      {user && suggestions.length > 0 && (
        <div className="panel mb-4" style={{ padding: 14 }}>
          <div className="uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            Sugerencias
          </div>
          {suggestions.map((u, i) => (
            <div key={u.id} className="row gap-3 mb-3 items-center">
              {/* Avatar */}
              <div
                className="avatar sm"
                style={{ background: avatarColor(i), flexShrink: 0 }}
              >
                {u.display_name?.charAt(0).toUpperCase() ?? 'U'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.display_name}
                </div>
                <div className="text-xs text-mute" style={{ fontFamily: 'var(--font-mono)' }}>
                  @{u.username}
                </div>
              </div>

              {/* Follow button */}
              <button
                className="btn btn-icon btn-small"
                title="Seguir"
                onClick={() => setFollowed(s => new Set([...s, u.id]))}
                style={{
                  background: followed.has(u.id) ? 'var(--bg-alt)' : 'var(--accent-1)',
                  flexShrink: 0,
                  width: 30, height: 30,
                }}
              >
                <UserPlus size={13} strokeWidth={2.5} />
              </button>

              {/* Dismiss button — white bg, icon color follows palette */}
              <button
                className="btn btn-icon btn-small"
                title="Descartar"
                onClick={() => setDismissed(s => new Set([...s, u.id]))}
                style={{
                  background: 'var(--bg-panel)',
                  color: 'var(--accent-1)',
                  flexShrink: 0,
                  width: 30, height: 30,
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contacts — solo logueados */}
      {user && contacts.length > 0 && (
        <div className="panel" style={{ padding: 14 }}>
          <div className="uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            Contactos
          </div>
          {contacts.map((u, i) => (
            <div key={u.id} className="row gap-3 mb-3" style={{ cursor: 'pointer' }}>
              <div
                className="avatar sm"
                style={{ background: avatarColor(i), flexShrink: 0 }}
              >
                {u.display_name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
