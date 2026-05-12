import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Paperclip, Send, Phone, Video, Smile, ArrowLeft, Mail } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useConversations } from '../../features/chat/useConversations'
import { useMessages, useSendMessage } from '../../features/chat/useMessages'
import { usePresence, usePresenceMap } from '../../features/presence/usePresence'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'
import { useToast } from '../../components/ui/Toast'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'var(--accent-1)', 'var(--accent-3)', 'var(--accent-4)',
  'var(--accent-5)', 'var(--accent-2)',
]
function strColor(str: string) {
  let h = 0
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1)  return 'ahora'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)    return `${d}d`
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function msgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'HOY'
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'AYER'
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()
}

// ─── Sq avatar ────────────────────────────────────────────────────────────────
function SqAvatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: strColor(name),
      border: '2px solid var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: size * 0.38, color: 'var(--ink)',
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── Action button ─────────────────────────────────────────────────────────────
function ActionBtn({ children, title, onClick, disabled }: {
  children: React.ReactNode
  title?: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button title={title} style={{
      width: 36, height: 36, border: '2px solid var(--ink)',
      background: 'var(--bg-panel)', cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '2px 2px 0 var(--ink)', transition: 'transform .08s, box-shadow .08s',
      opacity: disabled ? .55 : 1,
    }}
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-1px,-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 var(--ink)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0 var(--ink)' }}
    >
      {children}
    </button>
  )
}

// ─── Thread panel ─────────────────────────────────────────────────────────────
function ThreadPanel({ conversationId, userId, otherId, otherName, onBack }: {
  conversationId: string; userId: string; otherId: string
  otherName: string; onBack: () => void
}) {
  const { data: messages = [] } = useMessages(conversationId, userId)
  const send     = useSendMessage(conversationId, userId)
  const presence = usePresence(otherId)
  const toast    = useToast()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend() {
    const body = draft.trim(); if (!body) return
    setDraft(''); await send.mutateAsync(body)
  }
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <main className="chat-thread">
      {/* Header */}
      <div className="chat-thread-head">
        <button data-mobile-back onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, marginRight: 2 }}>
          <ArrowLeft size={16} strokeWidth={2.5} />
        </button>
        <SqAvatar name={otherName} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>{otherName}</div>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: presence.color, letterSpacing: '.04em', marginTop: 1 }}>
            {presence.label || (presence.status === 'offline' ? '● OFFLINE' : '● ACTIVO')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <ActionBtn title="Llamar" onClick={() => toast('Llamadas proximamente')}>
            <Phone size={15} strokeWidth={2.5} />
          </ActionBtn>
          <ActionBtn title="Video" onClick={() => toast('Video proximamente')}>
            <Video size={15} strokeWidth={2.5} />
          </ActionBtn>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-msgs">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-panel)', border: '1px solid var(--ink)', padding: '3px 12px', opacity: .7 }}>
            Se el primero en escribir
          </div>
        )}
        {messages.map((m, index) => {
          const day = dayLabel(m.created_at)
          const prevDay = index > 0 ? dayLabel(messages[index - 1].created_at) : ''
          const showSep = day !== prevDay
          const isMe = m.sender_id === userId
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {showSep && <div className="chat-day-sep">{day}</div>}
              <div className={`msg-bubble ${isMe ? 'me' : 'them'}`}>
                <div style={{ fontSize: 14 }}>{m.body}</div>
                <div className="msg-time">{msgTime(m.created_at)}{isMe && ' ✓✓'}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <ActionBtn title="Adjuntar" onClick={() => toast('Adjuntos proximamente')}>
          <Paperclip size={14} strokeWidth={2.5} />
        </ActionBtn>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Mensaje..."
          style={{ flex: 1, padding: '8px 12px', fontSize: 14, border: '2px solid var(--ink)', background: 'var(--bg-panel)', outline: 'none' }}
        />
        <ActionBtn title="Emoji" onClick={() => toast('Emojis proximamente')}>
          <Smile size={14} strokeWidth={2.5} />
        </ActionBtn>
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || send.isPending}
          style={{
            width: 36, height: 36, border: '2px solid var(--ink)', flexShrink: 0,
            background: 'var(--bg-panel)',
            color: 'var(--ink)',
            cursor: draft.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 2px 0 var(--ink)',
            opacity: !draft.trim() ? .4 : 1,
          }}
        >
          <Send size={15} strokeWidth={2.5} />
        </button>
      </div>
    </main>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const toast = useToast()

  useLayoutEffect(() => {
    if (window.innerWidth > 760) return
    const bar = document.querySelector<HTMLElement>('.mobile-bar')
    if (bar) document.documentElement.style.setProperty('--mob-bar-h', `${bar.offsetHeight}px`)
    return () => { document.documentElement.style.removeProperty('--mob-bar-h') }
  }, [])

  const { data: convs = [], isLoading } = useConversations(user?.id)
  const otherIds    = convs.map(c => c.other.id)
  const presenceMap = usePresenceMap(otherIds)

  const activeId   = params.get('c')
  const activeConv = convs.find(c => c.id === activeId) ?? null

  const filtered = convs.filter(c =>
    !search || c.other.display_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
      <div className={`chat-grid${activeId ? ' show-thread' : ''}`} style={{ height: undefined }}>

        {/* ── Lista de conversaciones ── */}
        <aside className="chat-list">
          {/* Header amarillo */}
          <div className="chat-list-head">
            <h2>NBOX</h2>
            <button style={{
              padding: '4px 10px', border: '2px solid var(--ink)',
              background: 'var(--bg-panel)', cursor: 'pointer',
              fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-body)',
              boxShadow: '2px 2px 0 var(--ink)',
            }}
              type="button"
              onClick={() => toast('Nuevo chat proximamente')}
            >
              + Nuevo
            </button>
          </div>

          {/* Search */}
          <div className="chat-list-search">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." />
          </div>

          {/* Conversations */}
          <div className="chat-list-body">
            {isLoading && (
              <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
                Cargando...
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.8 }}>
                Sin conversaciones.<br />Ve a Contactos para iniciar un chat.
              </div>
            )}
            {filtered.map(c => {
              const p = presenceMap[c.other.id]
              return (
                <div
                  key={c.id}
                  className={`chat-item${c.id === activeId ? ' active' : ''}`}
                  onClick={() => setParams({ c: c.id })}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <SqAvatar name={c.other.display_name} size={52} />
                    {p && (
                      <div style={{
                        position: 'absolute', bottom: -2, right: -2,
                        width: 10, height: 10,
                        background: p.dotColor,
                        border: '2px solid #111111',
                      }} />
                    )}
                  </div>
                  <div className="ci-body">
                    <div className="ci-name">
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {c.other.display_name}
                      </span>
                      {c.last_message_at && (
                        <span className="ci-time">{timeAgo(c.last_message_at)}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="ci-last">
                        {c.last_message_text ?? `@${c.other.username}`}
                      </div>
                      {c.has_unread && <div className="ci-unread">!</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* ── Thread / Empty state ── */}
        {activeConv ? (
          <ThreadPanel
            conversationId={activeConv.id}
            userId={user?.id ?? ''}
            otherId={activeConv.other.id}
            otherName={activeConv.other.display_name}
            onBack={() => setParams({})}
          />
        ) : (
          <main className="chat-thread" style={{ alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg)' }}>
            <div style={{
              width: 80, height: 80, background: 'var(--accent-1)',
              border: '3px solid var(--ink)', boxShadow: 'var(--shadow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
            }}>
              <Mail size={34} strokeWidth={2.5} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.02em' }}>
              NBOX
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Selecciona una conversacion para empezar
            </div>
          </main>
        )}
      </div>
    </AppShell>
  )
}
