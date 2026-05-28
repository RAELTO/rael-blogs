import { Link, useParams } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'
import Avatar from '../../components/ui/Avatar'
import AdminBadge from '../../components/ui/AdminBadge'
import BoxCard from '../../components/feed/BoxCard'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfileByUsername } from '../../features/profile/useProfile'
import { useBoxesByAuthor, useDeleteBox } from '../../features/boxes/useBoxes'
import { useToast } from '../../components/ui/Toast'

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const toast = useToast()

  const { data: profile, isLoading: loadingProfile } = useProfileByUsername(username)
  const { data: boxes, isLoading: loadingBoxes } = useBoxesByAuthor(profile?.id)
  const deleteBox = useDeleteBox()

  const isOwn = !!user && !!profile && user.id === profile.id

  function handleDelete(id: string) {
    deleteBox.mutate(id, {
      onSuccess: () => toast('Box deleted.'),
      onError: () => toast('Failed to delete.'),
    })
  }

  return (
    <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
      {loadingProfile ? (
        <div className="spinner">
          <div className="spinner-ring" />
          <span className="spinner-label">loading profile...</span>
        </div>
      ) : !profile ? (
        <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>
            User not found
          </div>
          <div className="text-mute text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
            @{username} does not exist on NBOX.
          </div>
        </div>
      ) : profile.is_banned ? (
        <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>
            Account suspended
          </div>
          <div className="text-mute text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
            This profile is not available.
          </div>
        </div>
      ) : (
        <>
          <div className="profile-cover mb-4" />
          <div className="profile-header-row">
            <Avatar
              name={profile.display_name}
              src={profile.avatar_url}
              size="lg"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                {profile.display_name}
                {profile.role === 'admin' && <AdminBadge />}
              </div>
              <div className="text-mute" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                @{profile.username}
              </div>
            </div>
            {isOwn && (
              <Link to="/my-box" className="btn" style={{ gap: 6, textDecoration: 'none' }}>
                <Settings2 size={15} strokeWidth={2.5} /> Edit profile
              </Link>
            )}
          </div>

          {profile.bio && (
            <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-mute)', marginBottom: 6 }}>
                Bio
              </div>
              <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
            </div>
          )}

          <h2 className="section-title" style={{ marginBottom: 16 }}>Drops</h2>

          {loadingBoxes && (
            <div className="spinner">
              <div className="spinner-ring" />
              <span className="spinner-label">loading drops...</span>
            </div>
          )}

          {!loadingBoxes && (boxes ?? []).length === 0 && (
            <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4 }}>
                No drops yet
              </div>
              <div className="text-mute text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                {isOwn ? 'Drop your first box from the feed.' : 'This user has not dropped anything yet.'}
              </div>
            </div>
          )}

          {(boxes ?? []).map(box => (
            <BoxCard
              key={box.id}
              box={box}
              onDelete={isOwn ? handleDelete : undefined}
            />
          ))}
        </>
      )}
    </AppShell>
  )
}
