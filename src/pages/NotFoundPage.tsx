import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import LeftSidebar from '../components/layout/LeftSidebar'
import RightSidebar from '../components/layout/RightSidebar'

export default function NotFoundPage() {
  return (
    <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
      <div className="panel" style={{ padding: 60, textAlign: 'center' }}>
        <div className="mp mp-gif" style={{ height: 120, maxWidth: 240, margin: '0 auto 24px', borderBottom: 'none' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '-0.03em', marginBottom: 8 }}>
          404
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>
          Box not found
        </div>
        <div className="text-mute text-sm" style={{ marginBottom: 24 }}>
          This page does not exist or was removed.
        </div>
        <Link to="/" className="btn btn-primary">
          ⌂ Back to feed
        </Link>
      </div>
    </AppShell>
  )
}
