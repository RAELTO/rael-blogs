import { createPortal } from 'react-dom'
import { useRef, useState, useEffect } from 'react'
import { Minus, X, Send, Phone, Video, Paperclip } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useMessages, useSendMessage } from '../../features/chat/useMessages'
import { usePresence } from '../../features/presence/usePresence'
import { useFloatingChat, type FloatingChatEntry } from '../../features/chat/FloatingChatContext'
import Avatar from '../ui/Avatar'
import { useToast } from '../ui/Toast'

function timeMsg(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function FloatingWindow({ entry, index }: { entry: FloatingChatEntry; index: number }) {
  const { user } = useAuth()
  const { closeChat, toggleMinimize } = useFloatingChat()
  const { data: messages = [] } = useMessages(entry.conversationId, user?.id)
  const sendMsg = useSendMessage(entry.conversationId, user?.id ?? '')
  const presence = usePresence(entry.otherId)
  const toast = useToast()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Clampar para que no salga de pantalla en tablet/móvil
  const right = Math.min(18 + index * 356, Math.max(10, window.innerWidth - 360))

  useEffect(() => {
    if (!entry.minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, entry.minimized])

  async function handleSend() {
    const body = draft.trim()
    if (!body) return
    setDraft('')
    await sendMsg.mutateAsync(body)
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend()
  }

  if (entry.minimized) {
    return (
      <div className="float-chat-min" style={{ right }} onClick={() => toggleMinimize(entry.conversationId)}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar name={entry.otherName} src={entry.otherAvatar} size="sm" />
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 9, height: 9,
            background: presence.dotColor,
            border: '2px solid #111111',
          }} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.otherName}
        </div>
        <button
          type="button"
          aria-label="Cerrar chat"
          style={{
            width: 26, height: 26, flexShrink: 0,
            background: 'var(--ink)', border: '2px solid var(--ink)',
            color: 'var(--bg-panel)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { e.stopPropagation(); closeChat(entry.conversationId) }}
        >
          <X size={13} strokeWidth={3} />
        </button>
      </div>
    )
  }

  return (
    <div className="float-chat" style={{ right }}>
      {/* Header */}
      <div className="fc-head">
        {/* Avatar con indicador cuadrado */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar name={entry.otherName} src={entry.otherAvatar} size="sm" />
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 9, height: 9,
            background: presence.dotColor,
            border: '2px solid #111111',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.otherName}
          </div>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: presence.color, letterSpacing: '.04em' }}>
            {presence.label || (presence.status === 'offline' ? '● OFFLINE' : '● ACTIVO')}
          </div>
        </div>
        <button className="fc-icon fc-call" type="button" title="Llamar" onClick={() => toast('Llamadas proximamente')}>
          <Phone size={13} strokeWidth={2.5} />
        </button>
        <button className="fc-icon fc-video" type="button" title="Video" onClick={() => toast('Video proximamente')}>
          <Video size={13} strokeWidth={2.5} />
        </button>
        <button className="fc-icon" type="button" title="Minimizar" onClick={() => toggleMinimize(entry.conversationId)}>
          <Minus size={12} strokeWidth={2.5} />
        </button>
        <button className="fc-icon" type="button" title="Cerrar" onClick={() => closeChat(entry.conversationId)}>
          <X size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* Messages */}
      <div className="fc-msgs">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
            Se el primero en escribir
          </div>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === user?.id
          return (
            <div key={m.id} className={`msg-bubble ${isMe ? 'me' : 'them'}`} style={{ fontSize: 13 }}>
              {m.body}
              <div className="msg-time">{timeMsg(m.created_at)}{isMe && ' ✓✓'}</div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fc-input">
        <button className="fc-icon" type="button" title="Adjuntar" onClick={() => toast('Adjuntos proximamente')}>
          <Paperclip size={13} strokeWidth={2.5} />
        </button>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Mensaje..."
          aria-label="Mensaje"
        />
        <button
          className="fc-icon"
          type="button"
          style={{ background: 'var(--bg-panel)', color: 'var(--ink)', opacity: draft.trim() ? 1 : .4 }}
          onClick={handleSend}
          disabled={!draft.trim()}
        >
          <Send size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export default function FloatingChats() {
  const { chats } = useFloatingChat()
  if (!chats.length) return null

  return createPortal(
    <>
      {chats.map((entry, i) => (
        <FloatingWindow key={entry.conversationId} entry={entry} index={i} />
      ))}
    </>,
    document.body
  )
}
