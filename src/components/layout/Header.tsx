import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile } from '../../features/profile/useProfile'
import Avatar from '../ui/Avatar'
import Icon from '../ui/Icon'

export default function Header() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const close = () => setMenuOpen(false)

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <NavLink to="/" className="brand-logo" onClick={close}>
          <span className="brand-mark">R</span>
          <span className="brand-name">Rael's blogs</span>
        </NavLink>
        <div className="brand-sub">ed.001</div>

        {/* Desktop nav */}
        <nav className="nav-links nav-desktop" aria-label="Navegación principal">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Feed
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Categorías
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Panel
            </NavLink>
          )}
        </nav>

        {/* Desktop right */}
        <div className="header-right nav-desktop">
          {user ? (
            <>
              <NavLink to="/dashboard/posts/new" className="btn btn-primary btn-small">
                <Icon name="plus" size={14} /> Nueva
              </NavLink>
              <NavLink to="/dashboard/profile" aria-label="Tu perfil" style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  name={profile?.display_name ?? user.email ?? 'U'}
                  size="sm"
                  src={profile?.avatar_url}
                />
              </NavLink>
              <button className="btn btn-ghost btn-icon" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={handleSignOut}>
                <Icon name="logout" size={18} />
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-small">
              Entrar
            </NavLink>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost btn-icon nav-mobile-toggle"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? <Icon name="close" size={20} /> : <Icon name="menu" size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="nav-mobile-drawer" aria-label="Menú móvil">
          <NavLink to="/" end className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
            Feed
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
            Categorías
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
              Panel
            </NavLink>
          )}
          {user && (
            <NavLink to="/dashboard/posts/new" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
              + Nueva publicación
            </NavLink>
          )}
          {user && (
            <NavLink to="/dashboard/favorites" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
              ★ Favoritos
            </NavLink>
          )}
          {user && (
            <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
              ✏ Mi perfil
            </NavLink>
          )}
          {user ? (
            <button className="nav-mobile-link" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--accent-1)' }} onClick={handleSignOut}>
              → Cerrar sesión
            </button>
          ) : (
            <NavLink to="/login" className="nav-mobile-link" onClick={close}>
              Entrar
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
