import { createPortal } from 'react-dom'
import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, X, Send, Phone, Video, Paperclip } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useMessages, useSendMessage } from '../../features/chat/useMessages'
import { usePresence } from '../../features/presence/usePresence'
import { useFloatingChat, type FloatingChatEntry } from '../../features/chat/FloatingChatContext'
import Avatar from '../ui/Avatar'
import { useToast } from '../ui/Toast'

function timeMsg(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
          aria-label="Close chat"
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
      <div className="fc-head">
        <Link
          to={`/profile/${entry.otherUsername}`}
          title={`View ${entry.otherName}'s profile`}
          style={{ position: 'relative', flexShrink: 0, display: 'block', textDecoration: 'none' }}
        >
          <Avatar name={entry.otherName} src={entry.otherAvatar} size="sm" />
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 9, height: 9,
            background: presence.dotColor,
            border: '2px solid #111111',
          }} />
        </Link>
        <Link
          to={`/profile/${entry.otherUsername}`}
          style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
        >
          <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.otherName}
          </div>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: presence.color, letterSpacing: '.04em' }}>
            {presence.label || (presence.status === 'offline' ? 'OFFLINE' : 'ACTIVE')}
          </div>
        </Link>
        <button className="fc-icon fc-call" type="button" title="Call" onClick={() => toast('Calls coming soon')}>
          <Phone size={13} strokeWidth={2.5} />
        </button>
        <button className="fc-icon fc-video" type="button" title="Video" onClick={() => toast('Video coming soon')}>
          <Video size={13} strokeWidth={2.5} />
        </button>
        <button className="fc-icon" type="button" title="Minimize" onClick={() => toggleMinimize(entry.conversationId)}>
          <Minus size={12} strokeWidth={2.5} />
        </button>
        <button className="fc-icon" type="button" title="Close" onClick={() => closeChat(entry.conversationId)}>
          <X size={12} strokeWidth={2.5} />
        </button>
      </div>

      <div className="fc-msgs">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
            Be the first to write
          </div>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === user?.id
          return (
            <div key={m.id} className={`msg-bubble ${isMe ? 'me' : 'them'}`} style={{ fontSize: 13 }}>
              {m.body}
              <div className="msg-time">{timeMsg(m.created_at)}{isMe && ' sent'}</div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="fc-input">
        <button className="fc-icon" type="button" title="Attach" onClick={() => toast('Attachments coming soon')}>
          <Paperclip size={13} strokeWidth={2.5} />
        </button>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message..."
          aria-label="Message"
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
