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
  if (min < 1) return 'now'
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
    <div className={`notif-item${!n.read_at ? ' unread' : ''}`}>
      {n.actor
        ? (
          <Link to={`/profile/${n.actor.username}`} onClick={onCloseDropdown} style={{ display: 'flex', textDecoration: 'none' }}>
            <Avatar name={n.actor.display_name} src={n.actor.avatar_url} size="sm" />
          </Link>
        )
        : <div className="notif-item-avatar-placeholder">★</div>
      }
      <div className="notif-item-body">
        <div className="notif-item-text">
          {n.actor && (
            <Link className="notif-item-actor-link" to={`/profile/${n.actor.username}`} onClick={onCloseDropdown}>
              {n.actor.display_name}
            </Link>
          )}
          {n.actor && ' '}
          {getNotifText(n)}
        </div>
        <div className="notif-item-time">{timeAgo(n.created_at)}</div>
      </div>
      {isContactReq && onAccept && onDecline && (
        <div className="notif-item-actions">
          <button type="button" className="contact-btn contact-btn-accept" onClick={() => onAccept(n)} title="Accept">
            <UserCheck size={12} strokeWidth={3} />
          </button>
          <button type="button" className="contact-btn contact-btn-decline" onClick={() => onDecline(n)} title="Decline">
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
    toast(`✓ ${n.actor?.display_name} es now tu contacto`)
  }
  async function handleDecline(n: NotificationRow) {
    if (!n.contact_request_id || !n.actor_id) return
    await respond.mutateAsync({ requestId: n.contact_request_id, requesterId: n.actor_id, accept: false })
    toast(`Request from ${n.actor?.display_name} declined`)
  }

  const preview = notifications.slice(0, 8)

  return createPortal(
    <div
      ref={modalRef}
      className="notif-dropdown"
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      <div className="notif-dropdown-header">
        <span className="notif-dropdown-title">Notifications</span>
        <button type="button" className="notif-dropdown-view-all" onClick={() => { navigate('/notifications'); onClose() }}>
          View all
        </button>
      </div>

      <div className="notif-dropdown-list">
        {preview.length === 0 && (
          <div className="notif-dropdown-empty">No notifications</div>
        )}
        {preview.map(n => (
          <NotifItem key={n.id} n={n}
            onCloseDropdown={onClose}
            onAccept={n.kind === 'contact_request' ? handleAccept : undefined}
            onDecline={n.kind === 'contact_request' ? handleDecline : undefined}
          />
        ))}
      </div>

      <button type="button"
        className="notif-dropdown-footer"
        onClick={() => { navigate('/notifications'); onClose() }}
      >
        VIEW ALL NOTIFICATIONS
      </button>
    </div>,
    document.body
  )
}
