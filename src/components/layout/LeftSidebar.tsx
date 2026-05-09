import { useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Compass, Contact, UsersRound, Clock, Bookmark, Settings2, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile } from '../../features/profile/useProfile'
import { useToast } from '../ui/Toast'
import AppearanceModal from '../ui/AppearanceModal'
import ConfirmDialog from '../ui/ConfirmDialog'
import Avatar from '../ui/Avatar'

export default function LeftSidebar() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const navigate = useNavigate()
  const toast = useToast()
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const appearanceBtnRef = useRef<HTMLButtonElement>(null)

  async function handleSignOut() {
    await signOut()
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
          <NavLink to="/my-box" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Avatar
              name={profile?.display_name ?? user.email ?? 'U'}
              src={profile?.avatar_url}
              size="sm"
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 800 }}>
                {profile?.display_name ?? user.email}
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                Mi Perfil
              </div>
            </div>
          </NavLink>
        )}

        <NavLink to="/" end className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
          <Home size={20} strokeWidth={2.5} /> Home
        </NavLink>

        <NavLink to="/explore" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
          <Compass size={20} strokeWidth={2.5} /> Explore
        </NavLink>

        {user && (
          <button className="side-link" onClick={() => toast('Amigos próximamente')}>
            <Contact size={20} strokeWidth={2.5} /> Amigos
          </button>
        )}

        {user && (
          <button className="side-link" onClick={() => toast('Grupos próximamente')}>
            <UsersRound size={20} strokeWidth={2.5} /> Grupos
          </button>
        )}

        {user && (
          <NavLink to="/saves" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Bookmark size={20} strokeWidth={2.5} /> Saved
          </NavLink>
        )}

        {user && (
          <button className="side-link" onClick={() => toast('Memorias próximamente')}>
            <Clock size={20} strokeWidth={2.5} /> Recuerdos
          </button>
        )}

        {/* Apariencia — opens modal */}
        <button
          ref={appearanceBtnRef}
          className={`side-link${appearanceOpen ? ' active' : ''}`}
          onClick={() => setAppearanceOpen(o => !o)}
        >
          <Settings2 size={20} strokeWidth={2.5} /> Apariencia
        </button>

        {user ? (
          <button className="side-link" onClick={() => setConfirmSignOut(true)}>
            <LogOut size={20} strokeWidth={2.5} /> Salir
          </button>
        ) : (
          <NavLink to="/login" className="side-link">
            <LogIn size={20} strokeWidth={2.5} /> Entrar
          </NavLink>
        )}
      </nav>

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
