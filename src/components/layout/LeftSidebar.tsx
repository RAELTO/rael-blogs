import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Home, Compass, Contact, Inbox, UsersRound, Clock, Bookmark, Settings2, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile } from '../../features/profile/useProfile'
import { useIncomingRequests } from '../../features/contacts/useContactRequests'
import { useContacts } from '../../features/contacts/useContacts'
import { usePresenceMap } from '../../features/presence/usePresence'
import { useGetOrCreateConversation } from '../../features/chat/useGetOrCreateConversation'
import { useOpenChat } from '../../features/chat/useOpenChat'
import { useIsAdmin } from '../../features/auth/useIsAdmin'
import { useToast } from '../ui/Toast'
import AppearanceModal from '../ui/AppearanceModal'
import ConfirmDialog from '../ui/ConfirmDialog'
import Avatar from '../ui/Avatar'
import AdminBadge from '../ui/AdminBadge'

const AVATAR_COLORS = ['var(--accent-1)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)', 'var(--accent-2)']

export default function LeftSidebar() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const isAdmin = useIsAdmin()
  const { data: incoming = [] } = useIncomingRequests(user?.id)
  const { data: realContacts = [] } = useContacts(user?.id)
  const presenceMap = usePresenceMap(realContacts.map(c => c.other.id))
  const getOrCreate = useGetOrCreateConversation(user?.id ?? '')
  const openChat = useOpenChat()
  const navigate = useNavigate()
  const toast = useToast()
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const appearanceBtnRef = useRef<HTMLButtonElement>(null)

  async function handleContactChat(otherId: string, otherName: string, otherUsername: string, otherAvatar: string | null) {
    const convId = await getOrCreate.mutateAsync(otherId)
    openChat({ conversationId: convId, otherId, otherName, otherUsername, otherAvatar })
  }

  async function handleSignOut() {
    await signOut()
    toast('Hasta pronto. Keep it loud ✦')
    navigate('/login')
    setConfirmSignOut(false)
  }

  return (
    <>
      {/* Sidebar panel — white background so text doesn't blend with dot-grid */}
      <nav
        className="side-nav"
        style={{
          background: 'var(--bg-panel)',
          border: 'var(--border)',
          boxShadow: 'var(--shadow)',
          padding: '10px 8px',
        }}
      >
        {/* Profile snippet */}
        {user && (
          <NavLink to="/my-box" title="Mi Perfil" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Avatar
              name={profile?.display_name ?? user.email ?? 'U'}
              src={profile?.avatar_url}
              size="sm"
            />
            <div className="side-link-info" style={{ minWidth: 0, flex: 1 }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 800 }}>
                {profile?.display_name ?? user.email}
                {isAdmin && <AdminBadge />}
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                Mi Perfil
              </div>
            </div>
          </NavLink>
        )}

        <NavLink to="/" end title="Home" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
          <Home size={20} strokeWidth={2.5} /> Home
        </NavLink>

        <NavLink to="/explore" title="Explore" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
          <Compass size={20} strokeWidth={2.5} /> Explore
        </NavLink>

        {user && (
          <NavLink to="/nbox" title="NBOX" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Inbox size={20} strokeWidth={2.5} /> NBOX
          </NavLink>
        )}

        {user && (
          <NavLink to="/contacts" title="Contactos" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Contact size={20} strokeWidth={2.5} /> Contactos
            {incoming.length > 0 && (
              <span className="badge" style={{ marginLeft: 'auto' }}>{incoming.length}</span>
            )}
          </NavLink>
        )}

        {user && (
          <button title="Grupos" className="side-link" onClick={() => toast('Grupos próximamente')}>
            <UsersRound size={20} strokeWidth={2.5} /> Grupos
          </button>
        )}

        {user && (
          <NavLink to="/saves" title="Saved" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Bookmark size={20} strokeWidth={2.5} /> Saved
          </NavLink>
        )}

        {user && (
          <button title="Recuerdos" className="side-link" onClick={() => toast('Memorias próximamente')}>
            <Clock size={20} strokeWidth={2.5} /> Recuerdos
          </button>
        )}

        {/* Apariencia — opens modal */}
        <button
          ref={appearanceBtnRef}
          title="Apariencia"
          className={`side-link${appearanceOpen ? ' active' : ''}`}
          onClick={() => setAppearanceOpen(o => !o)}
        >
          <Settings2 size={20} strokeWidth={2.5} /> Apariencia
        </button>

        {user ? (
          <button title="Salir" className="side-link side-link-danger" onClick={() => setConfirmSignOut(true)}>
            <LogOut size={20} strokeWidth={2.5} /> Salir
          </button>
        ) : (
          <NavLink to="/login" title="Entrar" className="side-link">
            <LogIn size={20} strokeWidth={2.5} /> Entrar
          </NavLink>
        )}

      </nav>

      {/* Panel Contactos — solo visible en tablet (821-1100px) via CSS */}
      {user && realContacts.length > 0 && (
        <div className="sidebar-tablet-contacts panel" style={{ padding: 14, marginTop: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
            Contactos
          </div>
          {realContacts.map((c, i) => (
            <div
              key={c.user_a + c.user_b}
              className="row gap-3 mb-3"
              style={{ cursor: 'pointer', padding: '3px 4px', transition: 'background .1s, transform .1s, box-shadow .1s' }}
              title={c.other.display_name}
              onClick={() => handleContactChat(c.other.id, c.other.display_name, c.other.username, c.other.avatar_url)}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.background = 'var(--accent-2)'
                el.style.transform = 'translate(-1px, -1px)'
                el.style.boxShadow = '3px 3px 0 var(--ink)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.background = ''
                el.style.transform = ''
                el.style.boxShadow = ''
              }}
            >
              <Link
                to={`/profile/${c.other.username}`}
                onClick={e => e.stopPropagation()}
                title={`Ver perfil de ${c.other.display_name}`}
                style={{ position: 'relative', flexShrink: 0, display: 'block', textDecoration: 'none' }}
              >
                <div className="avatar sm" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {c.other.display_name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                {presenceMap[c.other.id] && (
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 9, height: 9,
                    background: presenceMap[c.other.id].dotColor,
                    border: '2px solid #111111',
                  }} />
                )}
              </Link>
              <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.other.display_name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sign out confirmation */}
      <ConfirmDialog
        open={confirmSignOut}
        title="¿Cerramos la señal?"
        message="Estás a punto de cerrar tu sesión. Tendrás que volver a identificarte para publicar, comentar o guardar boxes."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Quedarme"
        onConfirm={handleSignOut}
        onCancel={() => setConfirmSignOut(false)}
      />

      {/* Appearance modal */}
      {appearanceOpen && (
        <AppearanceModal
          onClose={() => setAppearanceOpen(false)}
          anchorRef={appearanceBtnRef}
        />
      )}
    </>
  )
}
