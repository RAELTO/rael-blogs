import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { UserCheck, UserX } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import {
  useNotifications, useMarkAllRead, getNotifText,
  type NotificationRow,
} from '../../features/notifications/useNotifications'
import { useRespondContactRequest } from '../../features/contacts/useContactMutations'
import { useToast } from '../ui/Toast'
import Avatar from '../ui/Avatar'

interface Props {
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function NotifItem({ n, onAccept, onDecline, onCloseDropdown }: {
  n: NotificationRow
  onAccept?: (n: NotificationRow) => void
  onDecline?: (n: NotificationRow) => void
  onCloseDropdown: () => void
}) {
  const isContactReq = n.kind === 'contact_request'
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 14px', borderBottom: '2px solid var(--ink)',
      background: !n.read_at ? 'var(--accent-2)' : 'var(--bg-panel)',
    }}>
      {n.actor
        ? (
          <Link to={`/profile/${n.actor.username}`} onClick={onCloseDropdown} style={{ display: 'flex', textDecoration: 'none' }}>
            <Avatar name={n.actor.display_name} src={n.actor.avatar_url} size="sm" />
          </Link>
        )
        : <div style={{ width: 32, height: 32, background: 'var(--bg-alt)', border: '2px solid var(--ink)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>★</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.35 }}>
          {n.actor && (
            <Link
              to={`/profile/${n.actor.username}`}
              onClick={onCloseDropdown}
              style={{ fontWeight: 800, color: 'inherit', textDecoration: 'none' }}
            >
              {n.actor.display_name}
            </Link>
          )}
          {n.actor && ' '}
          {getNotifText(n)}
        </div>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', marginTop: 3, fontWeight: 700 }}>
          {timeAgo(n.created_at)}
        </div>
      </div>
      {isContactReq && onAccept && onDecline && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            className="contact-btn contact-btn-accept"
            onClick={() => onAccept(n)}
            title="Aceptar"
          >
            <UserCheck size={12} strokeWidth={3} />
          </button>
          <button
            className="contact-btn contact-btn-decline"
            onClick={() => onDecline(n)}
            title="Rechazar"
          >
            <UserX size={12} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function NotificationsDropdown({ anchorRef, onClose }: Props) {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { data: notifications = [] } = useNotifications(user?.id)
  const markAllRead = useMarkAllRead(user?.id)
  const respond = useRespondContactRequest(user?.id ?? '')
  const modalRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 360 })

  useLayoutEffect(() => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (rect) {
      const dropW = Math.min(360, window.innerWidth - 16)
      let left = rect.right - dropW
      if (left < 8) left = 8
      setPosition({ top: rect.bottom + 6, left, width: dropW })
    }
  }, [anchorRef])

  // Marcar todo como leído al abrir
  useEffect(() => {
    markAllRead.mutate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        modalRef.current && !modalRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [onClose, anchorRef])

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

  const preview = notifications.slice(0, 8)

  return createPortal(
    <div
      ref={modalRef}
      style={{
        position: 'fixed', top: position.top, left: position.left, zIndex: 9000,
        width: position.width,
        background: 'var(--bg-panel)',
        border: '3px solid var(--ink)',
        boxShadow: '6px 6px 0 var(--ink)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '3px solid var(--ink)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '-0.01em' }}>
          Notificaciones
        </span>
        <button
          onClick={() => { navigate('/notifications'); onClose() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--accent-1)', letterSpacing: '.06em', textTransform: 'uppercase' }}
        >
          Ver todo →
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {preview.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
            Sin notificaciones
          </div>
        )}
        {preview.map(n => (
          <NotifItem key={n.id} n={n}
            onCloseDropdown={onClose}
            onAccept={n.kind === 'contact_request' ? handleAccept : undefined}
            onDecline={n.kind === 'contact_request' ? handleDecline : undefined}
          />
        ))}
      </div>

      {/* Footer */}
      <button
        onClick={() => { navigate('/notifications'); onClose() }}
        style={{
          width: '100%', padding: '10px', background: 'var(--bg-alt)',
          border: 'none', borderTop: '2px solid var(--ink)',
          fontWeight: 800, fontSize: 12, cursor: 'pointer',
          fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-2)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-alt)' }}
      >
        VER TODAS LAS NOTIFICACIONES
      </button>
    </div>,
    document.body
  )
}
