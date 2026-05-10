import { useState } from 'react'
import { UserPlus, UserCheck, UserX, X, MessageCircle } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useGetOrCreateConversation } from '../../features/chat/useGetOrCreateConversation'
import { useOpenChat } from '../../features/chat/useOpenChat'
import { usePresenceMap } from '../../features/presence/usePresence'
import { useIncomingRequests, useOutgoingRequests } from '../../features/contacts/useContactRequests'
import { useContacts } from '../../features/contacts/useContacts'
import { useSuggestedContacts } from '../../features/contacts/useSuggestedContacts'
import {
  useSendContactRequest,
  useCancelContactRequest,
  useRespondContactRequest,
  useRemoveContact,
} from '../../features/contacts/useContactMutations'
import { useToast } from '../../components/ui/Toast'
import Avatar from '../../components/ui/Avatar'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'
import type { ContactRequestRow } from '../../features/contacts/useContactRequests'
import type { Profile } from '../../types/database'

type Tab = 'requests' | 'suggest' | 'all'

const AVATAR_COLORS = [
  'var(--accent-1)', 'var(--accent-3)', 'var(--accent-4)',
  'var(--accent-5)', 'var(--accent-2)',
]
function avatarColor(i: number) { return AVATAR_COLORS[i % AVATAR_COLORS.length] }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1)  return 'ahora'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h`
  return `${Math.floor(h / 24)}d`
}

// ─── Incoming request card ────────────────────────────────────────────────────
function IncomingCard({ req, onAccept, onDecline }: {
  req: ContactRequestRow
  onAccept: (req: ContactRequestRow) => void
  onDecline: (req: ContactRequestRow) => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderBottom: '2px solid var(--ink)',
      background: 'var(--accent-2)',
    }}>
      <Avatar name={req.requester.display_name} src={req.requester.avatar_url} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{req.requester.display_name}</div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)' }}>
          @{req.requester.username} · {timeAgo(req.created_at)}
        </div>
        <div style={{ fontSize: 12, marginTop: 2, color: 'var(--ink-dim)' }}>
          quiere agregarte como contacto
        </div>
      </div>
      <button
        className="contact-btn contact-btn-accept"
        style={{ width: 'auto', padding: '0 12px', gap: 5 }}
        onClick={() => onAccept(req)}
      >
        <UserCheck size={13} strokeWidth={3} /> Aceptar
      </button>
      <button
        className="contact-btn contact-btn-decline"
        style={{ width: 'auto', padding: '0 12px', gap: 5 }}
        onClick={() => onDecline(req)}
      >
        <UserX size={13} strokeWidth={3} /> Rechazar
      </button>
    </div>
  )
}

// ─── Outgoing request card ────────────────────────────────────────────────────
function OutgoingCard({ req, onCancel }: {
  req: ContactRequestRow
  onCancel: (req: ContactRequestRow) => void
}) {
  const label = req.status === 'accepted' ? '✓ Aceptada'
    : req.status === 'declined' ? '✕ Rechazada'
    : 'Pendiente'
  const bg = req.status === 'accepted' ? 'var(--accent-4)'
    : req.status === 'declined' ? 'var(--accent-1)'
    : 'var(--bg-alt)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderBottom: '2px solid var(--ink)',
    }}>
      <Avatar name={req.addressee.display_name} src={req.addressee.avatar_url} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{req.addressee.display_name}</div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)' }}>
          @{req.addressee.username} · {timeAgo(req.created_at)}
        </div>
      </div>
      <div style={{
        padding: '3px 10px', border: '2px solid var(--ink)',
        background: bg, fontSize: 11, fontFamily: 'var(--font-mono)',
        fontWeight: 800, whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      {req.status === 'pending' && (
        <button
          className="btn btn-small"
          style={{ padding: '4px 8px' }}
          onClick={() => onCancel(req)}
          title="Cancelar solicitud"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

// ─── Suggestion card ──────────────────────────────────────────────────────────
function SuggestionCard({ profile, index, onAdd }: {
  profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  index: number
  onAdd: (id: string) => void
}) {
  const [sent, setSent] = useState(false)
  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        height: 100,
        background: avatarColor(index),
        backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 14px, rgba(0,0,0,0.07) 14px 16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '3px solid var(--ink)',
      }}>
        <Avatar name={profile.display_name} src={profile.avatar_url} size="lg" />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontWeight: 800, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile.display_name}
        </div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', marginTop: 2 }}>
          @{profile.username}
        </div>
        <button
          className={`btn btn-small ${sent ? '' : 'btn-primary'}`}
          style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
          disabled={sent}
          onClick={() => { onAdd(profile.id); setSent(true) }}
        >
          {sent
            ? <><UserCheck size={13} strokeWidth={2.5} /> Solicitud enviada</>
            : <><UserPlus size={13} strokeWidth={2.5} /> Agregar contacto</>
          }
        </button>
      </div>
    </div>
  )
}

// ─── Contact card ─────────────────────────────────────────────────────────────
function ContactCard({ profile, index, userId, presence, onRemove }: {
  profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  index: number
  userId: string
  presence: { label: string; color: string } | undefined
  onRemove: (id: string) => void
}) {
  const getOrCreate = useGetOrCreateConversation(userId)
  const openChat    = useOpenChat()

  async function handleMessage() {
    const convId = await getOrCreate.mutateAsync(profile.id)
    openChat({ conversationId: convId, otherId: profile.id, otherName: profile.display_name, otherAvatar: profile.avatar_url })
  }

  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        height: 80,
        background: avatarColor(index),
        backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 14px, rgba(0,0,0,0.07) 14px 16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '3px solid var(--ink)',
      }}>
        <Avatar name={profile.display_name} src={profile.avatar_url} size="md" />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontWeight: 800, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile.display_name}
        </div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', marginTop: 2 }}>
          @{profile.username}
        </div>
        {presence?.label && (
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: presence.color, marginTop: 3, letterSpacing: '.04em' }}>
            {presence.label}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button
            className="btn btn-small btn-primary"
            style={{ flex: 1, justifyContent: 'center', gap: 4 }}
            onClick={handleMessage}
            disabled={getOrCreate.isPending}
          >
            <MessageCircle size={13} strokeWidth={2.5} /> Mensaje
          </button>
          <button
            className="btn btn-small"
            style={{ padding: '4px 8px', color: 'var(--accent-1)' }}
            title="Eliminar contacto"
            onClick={() => onRemove(profile.id)}
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContactsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('requests')

  const { data: incoming = [] }    = useIncomingRequests(user?.id)
  const { data: outgoing = [] }    = useOutgoingRequests(user?.id)
  const { data: contacts = [] }    = useContacts(user?.id)
  const { data: suggestions = [] } = useSuggestedContacts(user?.id)

  const sendRequest   = useSendContactRequest(user?.id ?? '')
  const cancelRequest = useCancelContactRequest(user?.id ?? '')
  const respond       = useRespondContactRequest(user?.id ?? '')
  const removeContact = useRemoveContact(user?.id ?? '')
  const presenceMap   = usePresenceMap(contacts.map(c => c.other.id))

  const pendingIncoming = incoming.length

  const NAV: { id: Tab; label: string; badge?: number }[] = [
    { id: 'requests', label: 'Solicitudes', badge: pendingIncoming },
    { id: 'suggest',  label: 'Sugerencias' },
    { id: 'all',      label: `Todos · ${contacts.length}` },
  ]

  async function handleAccept(req: ContactRequestRow) {
    await respond.mutateAsync({ requestId: req.id, requesterId: req.requester_id, accept: true })
    toast(`✓ Ahora eres contacto de ${req.requester.display_name}`)
  }

  async function handleDecline(req: ContactRequestRow) {
    await respond.mutateAsync({ requestId: req.id, requesterId: req.requester_id, accept: false })
    toast(`Solicitud de ${req.requester.display_name} rechazada`)
  }

  async function handleCancel(req: ContactRequestRow) {
    await cancelRequest.mutateAsync(req.id)
    toast('Solicitud cancelada')
  }

  async function handleAdd(addresseeId: string) {
    await sendRequest.mutateAsync(addresseeId)
    toast('Solicitud enviada')
  }

  async function handleRemove(otherId: string) {
    await removeContact.mutateAsync(otherId)
    toast('Contacto eliminado')
  }

  return (
    <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
      <div className="contacts-page-grid">
        {/* ── Nav lateral ── */}
        <div className="panel" style={{ padding: '12px 8px' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 20,
            letterSpacing: '-0.02em', padding: '4px 8px 12px',
            borderBottom: '2px solid var(--ink)', marginBottom: 8,
          }}>
            CONTACTOS
          </div>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`side-link${tab === n.id ? ' active' : ''}`}
              style={{ width: '100%' }}
            >
              {n.label}
              {!!n.badge && n.badge > 0 && (
                <span className="badge" style={{ marginLeft: 'auto' }}>{n.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div>
          {/* SOLICITUDES */}
          {tab === 'requests' && (
            <>
              {/* Recibidas */}
              <div style={{ marginBottom: 20 }}>
                <h2 className="section-title" style={{ marginBottom: 12 }}>
                  ▸ Recibidas
                </h2>
                {incoming.length === 0 ? (
                  <div className="panel" style={{ padding: '32px 20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>SIN SOLICITUDES</div>
                    <div className="text-sm text-mute mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
                      Cuando alguien te pida ser contacto, aparecerá aquí
                    </div>
                  </div>
                ) : (
                  <div className="panel" style={{ padding: 0 }}>
                    {incoming.map(r => (
                      <IncomingCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline} />
                    ))}
                  </div>
                )}
              </div>

              {/* Enviadas */}
              {outgoing.length > 0 && (
                <div>
                  <h2 className="section-title" style={{ marginBottom: 12 }}>▸ Enviadas</h2>
                  <div className="panel" style={{ padding: 0 }}>
                    {outgoing.map(r => (
                      <OutgoingCard key={r.id} req={r} onCancel={handleCancel} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* SUGERENCIAS */}
          {tab === 'suggest' && (
            <>
              <h2 className="section-title" style={{ marginBottom: 16 }}>▸ Sugerencias para ti</h2>
              {suggestions.length === 0 ? (
                <div className="panel" style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>NADA POR AHORA</div>
                  <div className="text-sm text-mute mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    Sigue a más usuarios para ver sugerencias relevantes
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                  {suggestions.map((p, i) => (
                    <SuggestionCard key={p.id} profile={p} index={i} onAdd={handleAdd} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* TODOS */}
          {tab === 'all' && (
            <>
              <h2 className="section-title" style={{ marginBottom: 16 }}>▸ Todos tus contactos</h2>
              {contacts.length === 0 ? (
                <div className="panel" style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>AÚN SIN CONTACTOS</div>
                  <div className="text-sm text-mute mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    Agrega contactos desde las sugerencias o desde el feed
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                  {contacts.map((c, i) => (
                    <ContactCard key={c.user_a + c.user_b} profile={c.other} index={i} userId={user!.id} presence={presenceMap[c.other.id]} onRemove={handleRemove} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
