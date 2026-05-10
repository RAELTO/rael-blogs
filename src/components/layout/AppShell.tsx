import { NavLink } from 'react-router-dom'
import { Home, Compass, Bell, Inbox, Plus, LogIn } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import Header from './Header'
import Avatar from '../ui/Avatar'
import { useProfile } from '../../features/profile/useProfile'

interface AppShellProps {
  children: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
  onDropClick?: () => void
}

const MOB_TABS = [
  { to: '/',              Icon: Home,    label: 'Home',   end: true  },
  { to: '/explore',       Icon: Compass, label: 'Explore', end: false },
  { to: '/notifications', Icon: Bell,    label: 'Notifs',  end: false },
  { to: '/inbox',         Icon: Inbox,   label: 'Inbox',   end: false },
] as const

export default function AppShell({ children, left, right, onDropClick }: AppShellProps) {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header onDropClick={onDropClick} />

      <div className="app-grid">
        <aside className="col-left">{left}</aside>
        <main>{children}</main>
        <aside className="col-right">{right}</aside>
      </div>

      {/* Mobile bottom bar */}
      <nav className="mobile-bar" aria-label="Navegación móvil">
        {MOB_TABS.map(({ to, Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `mb-item${isActive ? ' active' : ''}`}
          >
            <Icon size={22} strokeWidth={2.5} />
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/"
          className="mb-item"
          onClick={e => { e.preventDefault(); onDropClick?.() }}
        >
          <Plus size={22} strokeWidth={2.5} />
          Drop
        </NavLink>
        {user ? (
          <NavLink to="/my-box" className={({ isActive }) => `mb-item${isActive ? ' active' : ''}`}>
            <Avatar
              name={profile?.display_name ?? user.email ?? 'U'}
              src={profile?.avatar_url}
              size="sm"
            />
            Yo
          </NavLink>
        ) : (
          <NavLink to="/login" className="mb-item">
            <LogIn size={22} strokeWidth={2.5} />
            Entrar
          </NavLink>
        )}
      </nav>
    </div>
  )
}
