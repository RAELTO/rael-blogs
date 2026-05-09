import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'
import { MOCK_NOTIFS, type MockNotif, type NotifKind } from '../../data/notifications'

// ─── Filter config ────────────────────────────────────────────────────────────
type FilterKey = 'all' | 'unread' | NotifKind

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'Todas'       },
  { key: 'unread',  label: 'No Leídas'   },
  { key: 'react',   label: 'Reacciones'  },
  { key: 'comment', label: 'Comentarios' },
  { key: 'follow',  label: 'Followers'   },
  { key: 'mention', label: 'Menciones'   },
]

// ─── Notif Avatar ─────────────────────────────────────────────────────────────
function NotifAvatar({ actor }: { actor?: MockNotif['actor'] }) {
  return (
    <div style={{
      width: 42, height: 42, flexShrink: 0,
      background: actor?.color ?? 'var(--accent-2)',
      border: '3px solid var(--ink)',
      boxShadow: '3px 3px 0 var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: 16, color: 'var(--ink)',
    }}>
      {actor?.initial ?? '★'}
    </div>
  )
}

// ─── Notif Item ───────────────────────────────────────────────────────────────
function NotifItem({ n }: { n: MockNotif }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 16px', borderBottom: '2px solid var(--ink)',
        background: n.unread ? 'var(--accent-2)' : 'var(--bg-panel)',
        cursor: 'pointer', transition: 'background .1s',
      }}
      onMouseEnter={e => {
        if (!n.unread) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-alt)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = n.unread ? 'var(--accent-2)' : 'var(--bg-panel)'
      }}
    >
      <NotifAvatar actor={n.actor} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: 1.45 }}>
          {n.actor && <strong style={{ fontWeight: 800 }}>{n.actor.name} </strong>}
          {n.text}
        </div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', marginTop: 5, fontWeight: 700 }}>
          {n.time}
        </div>
      </div>

      {n.unread && (
        <div style={{
          padding: '2px 8px', border: '2px solid var(--ink)',
          background: 'var(--accent-1)', color: 'var(--ink)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 900,
          letterSpacing: '.1em', textTransform: 'uppercase',
          alignSelf: 'center', flexShrink: 0,
          boxShadow: '2px 2px 0 var(--ink)',
        }}>
          NEW
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const filtered = MOCK_NOTIFS.filter(n => {
    if (activeFilter === 'all')    return true
    if (activeFilter === 'unread') return n.unread
    return n.kind === activeFilter
  })

  return (
    <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 28,
        letterSpacing: '-0.02em', marginBottom: 16,
        borderBottom: '3px solid var(--ink)', paddingBottom: 12,
      }}>
        NBOX · NOTIFS
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {FILTERS.map(f => {
          const isActive = activeFilter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '4px 12px', border: '2px solid var(--ink)',
                background: isActive ? 'var(--accent-3)' : 'var(--bg-panel)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '.06em', cursor: 'pointer',
                boxShadow: isActive ? 'none' : '2px 2px 0 var(--ink)',
                transform: isActive ? 'translate(2px, 2px)' : 'none',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Notifications list */}
      <div className="panel" style={{ padding: 0 }}>
        {filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>
            Sin notificaciones aquí
          </div>
        )}
        {filtered.map(n => (
          <NotifItem key={n.id} n={n} />
        ))}
      </div>
    </AppShell>
  )
}
