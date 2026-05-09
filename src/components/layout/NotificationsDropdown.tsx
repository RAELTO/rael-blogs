import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MOCK_NOTIFS } from '../../data/notifications'

interface Props {
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
}

function NotifAvatar({ actor }: { actor?: { initial: string; color: string } }) {
  return (
    <div style={{
      width: 36, height: 36, flexShrink: 0,
      background: actor?.color ?? 'var(--accent-2)',
      border: '2px solid var(--ink)',
      boxShadow: '2px 2px 0 var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: 14, color: 'var(--ink)',
    }}>
      {actor?.initial ?? '★'}
    </div>
  )
}

export default function NotificationsDropdown({ anchorRef, onClose }: Props) {
  const navigate = useNavigate()
  const modalRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, right: 0 })

  useLayoutEffect(() => {
    const rect = anchorRef.current?.getBoundingClientRect()
    setPosition({
      top: rect ? rect.bottom + 6 : 0,
      right: rect ? window.innerWidth - rect.right : 0,
    })
  }, [anchorRef])

  const preview = MOCK_NOTIFS.slice(0, 6)

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

  return createPortal(
    <div
      ref={modalRef}
      style={{
        position: 'fixed', top: position.top, right: position.right, zIndex: 9000,
        width: 360,
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

      {/* List (max 6, scrollable) */}
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {preview.map(n => (
          <div
            key={n.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 14px', borderBottom: '2px solid var(--ink)',
              background: n.unread ? 'var(--accent-2)' : 'var(--bg-panel)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { if (!n.unread) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-alt)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.unread ? 'var(--accent-2)' : 'var(--bg-panel)' }}
          >
            <NotifAvatar actor={n.actor} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                {n.actor && <strong>{n.actor.name} </strong>}
                {n.text}
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', marginTop: 3, fontWeight: 700 }}>
                {n.time}
              </div>
            </div>
            {n.unread && (
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent-1)', flexShrink: 0, marginTop: 4,
              }} />
            )}
          </div>
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
