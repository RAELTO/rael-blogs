import { lazy, Suspense, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Compass, Contact, Bell, Inbox, LogIn } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import Header from './Header'
import Avatar from '../ui/Avatar'
import { useProfile } from '../../features/profile/useProfile'

const DropModal = lazy(() => import('../feed/DropModal'))

interface AppShellProps {
  children: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
  onDropClick?: () => void
}

const MOB_TABS = [
  { to: '/',              Icon: Home,    label: 'Home',     end: true  },
  { to: '/explore',       Icon: Compass, label: 'Explore',  end: false },
  { to: '/contacts',      Icon: Contact, label: 'Contacts', end: false },
  { to: '/notifications', Icon: Bell,    label: 'Notifs',   end: false },
  { to: '/nbox',          Icon: Inbox,   label: 'NBOX',     end: false },
] as const

export default function AppShell({ children, left, right, onDropClick }: AppShellProps) {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const [shellDropOpen, setShellDropOpen] = useState(false)
  const handleDropClick = onDropClick ?? (() => setShellDropOpen(true))

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header onDropClick={handleDropClick} />

      <div className="app-grid">
        <aside className="col-left">{left}</aside>
        <main id="main-content" tabIndex={-1}>{children}</main>
        <aside className="col-right">{right}</aside>
      </div>

      {/* Mobile bottom bar */}
      <nav className="mobile-bar" aria-label="Mobile navigation">
        {MOB_TABS.map(({ to, Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `mb-item${isActive ? ' active' : ''}`}
          >
            <Icon size={22} strokeWidth={2.5} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
        {user ? (
          <NavLink to="/yo" className={({ isActive }) => `mb-item${isActive ? ' active' : ''}`}>
            <Avatar
              name={profile?.display_name ?? user.email ?? 'U'}
              src={profile?.avatar_url}
              size="sm"
            />
            Me
          </NavLink>
        ) : (
          <NavLink to="/login" className="mb-item">
            <LogIn size={22} strokeWidth={2.5} aria-hidden="true" />
            Sign in
          </NavLink>
        )}
      </nav>
      {shellDropOpen && (
        <Suspense fallback={null}>
          <DropModal onClose={() => setShellDropOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
