import { useState } from 'react'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile } from '../../features/profile/useProfile'
import { useCreateBox } from '../../features/boxes/useBoxes'
import { useToast } from '../ui/Toast'
import Avatar from '../ui/Avatar'
import { Camera } from 'lucide-react'
import type { BoxType } from '../../types/database'

interface ComposerCardProps {
  onOpenModal?: (type: BoxType) => void
}

export default function ComposerCard({ onOpenModal }: ComposerCardProps) {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const createBox = useCreateBox()
  const toast = useToast()
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)

  if (!user) return null

  async function handleQuickDrop() {
    if (!text.trim() || !user) return
    try {
      await createBox.mutateAsync({
        author_id: user.id,
        type: 'quick',
        content: text.trim(),
        payload: {},
      })
      setText('')
      setExpanded(false)
      toast('Drop published.')
    } catch {
      toast('Failed to publish. Please try again.')
    }
  }

  const openModal = (type: BoxType) => {
    if (onOpenModal) onOpenModal(type)
    else setExpanded(false)
  }

  return (
    <div className="panel composer">
      <div className="composer-row">
        <Avatar
          name={profile?.display_name ?? user.email ?? 'U'}
          src={profile?.avatar_url}
          size="md"
        />
        <div className="composer-input" onClick={() => openModal('quick')}>
          What are you dropping, {profile?.display_name ?? 'you'}?
        </div>
      </div>

      {expanded && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => { setExpanded(false); setText('') }}>
            Cancel
          </button>
          <button type="button"
            className="btn btn-primary btn-small"
            onClick={handleQuickDrop}
            disabled={!text.trim() || createBox.isPending}
            style={{ marginLeft: 8 }}
          >
            {createBox.isPending ? '...' : 'Drop'}
          </button>
        </div>
      )}

      <div className="composer-actions">
        <button type="button" className="composer-action ca-media" onClick={() => openModal('media')}>
          <Camera size={14} strokeWidth={2.5} /> Photo
        </button>
        <button type="button" className="composer-action ca-poll" onClick={() => openModal('poll')}>
          Poll
        </button>
        <button type="button" className="composer-action ca-mood" onClick={() => openModal('mood')}>
          Mood
        </button>
        <button type="button" className="composer-action ca-link" onClick={() => openModal('link')}>
          Link
        </button>
      </div>
    </div>
  )
}
