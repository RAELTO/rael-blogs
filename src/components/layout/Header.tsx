import { useState, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Inbox, Bell, Search, Plus, Palette, Compass } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile } from '../../features/profile/useProfile'
import Avatar from '../ui/Avatar'
import NboxLogo from '../../assets/icons/NboxLogo'
import NotificationsDropdown from './NotificationsDropdown'
import AppearanceModal from '../ui/AppearanceModal'
import { useUnreadCount } from '../../features/notifications/useNotifications'

interface Tab {
  to: string
  Icon: React.ElementType
  label: string
  end: boolean
  badge?: number
}

const NAV_TABS: Tab[] = [
  { to: '/',              Icon: Home,  label: 'Home',           end: true  },
  { to: '/inbox',         Icon: Inbox, label: 'NBOX',           end: false, badge: 0 },
  { to: '/notifications', Icon: Bell,  label: 'Notificaciones', end: false, badge: 0 },
]

interface HeaderProps {
  onDropClick?: () => void
}

export default function Header({ onDropClick }: HeaderProps) {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const { data: unreadCount = 0 } = useUnreadCount(user?.id)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const paletteRef = useRef<HTMLButtonElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    if (q) navigate(`/explore?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Brand */}
        <NavLink to="/" className="brand-logo">
          <span className="brand-mark">
            <NboxLogo style={{ width: 34, height: 34, display: 'block' }} />
          </span>
          <span className="brand-name">NBOX</span>
        </NavLink>

        {/* Search */}
        <form className="header-search" onSubmit={handleSearch}>
          <span className="header-search-icon">
            <Search size={17} strokeWidth={2.5} />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar en NBOX"
            aria-label="Buscar"
          />
        </form>

        {/* Center nav tabs — Inbox y Bell solo visibles si está logueado */}
        <nav className="header-tabs" aria-label="Navegación">
          {NAV_TABS.filter(t => user || t.Icon === Home).map(({ to, Icon, label, end, badge }) => {
            if (Icon === Bell) {
              return (
                <button
                  key={to}
                  ref={bellRef}
                  className={`header-tab${notifOpen ? ' active' : ''}`}
                  title={label}
                  onClick={() => setNotifOpen(o => !o)}
                  style={{ position: 'relative' }}
                >
                  <Bell size={22} strokeWidth={2.5} />
                  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
              )
            }
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `header-tab${isActive ? ' active' : ''}`}
                title={label}
              >
                <Icon size={22} strokeWidth={2.5} />
                {!!badge && badge > 0 && <span className="badge">{badge}</span>}
              </NavLink>
            )
          })}
        </nav>

        {notifOpen && (
          <NotificationsDropdown
            anchorRef={bellRef}
            onClose={() => setNotifOpen(false)}
          />
        )}

        {/* Right actions */}
        <div className="header-right">
          {user ? (
            <>
              {/* Explore/Search — solo visible en móvil (reemplazó el tab de Explore) */}
              <NavLink
                to="/explore"
                className={({ isActive }) => `btn btn-icon header-mobile-btn${isActive ? ' active' : ''}`}
                title="Explorar"
              >
                <Compass size={18} strokeWidth={2.5} />
              </NavLink>
              {/* Apariencia — solo visible en móvil (desktop usa el sidebar) */}
              <button
                ref={paletteRef}
                className="btn btn-icon header-palette-btn"
                title="Apariencia"
                onClick={() => setPaletteOpen(o => !o)}
              >
                <Palette size={18} strokeWidth={2.5} />
              </button>
              <button className="btn btn-icon btn-primary" title="Drop" onClick={onDropClick}>
                <Plus size={20} strokeWidth={2.5} />
              </button>
              <NavLink to="/my-box" style={{ display: 'flex' }} title="Mi Perfil">
                <Avatar
                  name={profile?.display_name ?? user.email ?? 'U'}
                  size="sm"
                  src={profile?.avatar_url}
                />
              </NavLink>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-small">
              Entrar
            </NavLink>
          )}
        </div>
      </div>

      {paletteOpen && (
        <AppearanceModal
          anchorRef={paletteRef}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </header>
  )
}
