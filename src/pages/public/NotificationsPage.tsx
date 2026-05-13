import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, UserX } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import {
  useNotifications, useMarkAllRead, getNotifText,
  type NotifKind, type NotificationRow,
} from '../../features/notifications/useNotifications'
import { useRespondContactRequest } from '../../features/contacts/useContactMutations'
import { useToast } from '../../components/ui/Toast'
import Avatar from '../../components/ui/Avatar'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'

// ─── Filter config ────────────────────────────────────────────────────────────
type FilterKey = 'all' | 'unread' | NotifKind

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',             label: 'Todas'       },
  { key: 'unread',          label: 'No Leídas'   },
  { key: 'contact_request', label: 'Contactos'   },
  { key: 'reaction',        label: 'Reacciones'  },
  { key: 'vote',            label: 'Votos'        },
  { key: 'comment',         label: 'Comentarios' },
  { key: 'follow',          label: 'Followers'   },
  { key: 'share',           label: 'Compartidos' },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

// ─── Notif Item ───────────────────────────────────────────────────────────────
function NotifItem({ n, onAccept, onDecline }: {
  n: NotificationRow
  onAccept?: (n: NotificationRow) => void
  onDecline?: (n: NotificationRow) => void
}) {
  const isContactReq = n.kind === 'contact_request'
  const isContactAcc = n.kind === 'contact_accepted'

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 16px', borderBottom: '2px solid var(--ink)',
      background: !n.read_at ? 'var(--accent-2)' : 'var(--bg-panel)',
      transition: 'background .1s',
    }}>
      {/* Avatar */}
      {n.actor
        ? (
          <Link to={`/profile/${n.actor.username}`} style={{ display: 'flex', textDecoration: 'none' }}>
            <Avatar name={n.actor.display_name} src={n.actor.avatar_url} size="md" />
          </Link>
        )
        : <div style={{ width: 40, height: 40, background: 'var(--bg-alt)', border: '3px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>★</div>
      }

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: 1.45 }}>
          {n.actor && (
            <Link to={`/profile/${n.actor.username}`} style={{ fontWeight: 800, color: 'inherit', textDecoration: 'none' }}>
              {n.actor.display_name}
            </Link>
          )}
          {n.actor && ' '}
          {getNotifText(n)}
        </div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', marginTop: 4, fontWeight: 700 }}>
          {timeAgo(n.created_at)}
        </div>
      </div>

      {/* Action buttons for contact requests */}
      {isContactReq && onAccept && onDecline && (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignSelf: 'center' }}>
          <button className="contact-btn contact-btn-accept" style={{ width: 'auto', padding: '0 10px', gap: 5 }} onClick={() => onAccept(n)}>
            <UserCheck size={13} strokeWidth={3} /> Aceptar
          </button>
          <button className="contact-btn contact-btn-decline" style={{ width: 'auto', padding: '0 10px', gap: 5 }} onClick={() => onDecline(n)}>
            <UserX size={13} strokeWidth={3} /> Rechazar
          </button>
        </div>
      )}

      {/* Badge for accepted contact */}
      {isContactAcc && (
        <div style={{
          padding: '2px 8px', border: '2px solid var(--ink)', flexShrink: 0, alignSelf: 'center',
          background: 'var(--accent-4)', fontSize: 10, fontFamily: 'var(--font-mono)',
          fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase',
          boxShadow: '2px 2px 0 var(--ink)',
        }}>
          NUEVO CONTACTO
        </div>
      )}

      {/* Unread indicator */}
      {!n.read_at && !isContactReq && (
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--accent-1)', flexShrink: 0, marginTop: 6,
        }} />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const { data: notifications = [] } = useNotifications(user?.id)
  const markAllRead = useMarkAllRead(user?.id)
  const respond = useRespondContactRequest(user?.id ?? '')

  // Marcar todo como leído al entrar
  useEffect(() => {
    markAllRead.mutate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAccept(n: NotificationRow) {
    if (!n.contact_request_id || !n.actor_id) return
    await respond.mutateAsync({ requestId: n.contact_request_id, requesterId: n.actor_id, accept: true })
    toast(`✓ ${n.actor?.display_name} es ahora tu contacto`)
  }
  async function handleDecline(n: NotificationRow) {
    if (!n.contact_request_id || !n.actor_id) return
    await respond.mutateAsync({ requestId: n.contact_request_id, requesterId: n.actor_id, accept: false })
    toast(`Solicitud de ${n.actor?.display_name} rechazada`)
  }

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all')    return true
    if (activeFilter === 'unread') return !n.read_at
    if (activeFilter === 'contact_request') return n.kind === 'contact_request' || n.kind === 'contact_accepted'
    return n.kind === activeFilter
  })

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 28,
        letterSpacing: '-0.02em', marginBottom: 16,
        borderBottom: '3px solid var(--ink)', paddingBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        NBOX · NOTIFS
        {unreadCount > 0 && (
          <span style={{
            fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 800,
            background: 'var(--accent-1)', border: '2px solid var(--ink)',
            padding: '2px 10px', boxShadow: '2px 2px 0 var(--ink)',
          }}>
            {unreadCount} sin leer
          </span>
        )}
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
          <NotifItem key={n.id} n={n}
            onAccept={n.kind === 'contact_request' ? handleAccept : undefined}
            onDecline={n.kind === 'contact_request' ? handleDecline : undefined}
          />
        ))}
      </div>
    </AppShell>
  )
}
