import { useAuth } from '../../features/auth/AuthContext'
import { useLikes, useToggleLike } from '../../features/interactions/useLikes'
import { useToast } from '../ui/Toast'
import Icon from '../ui/Icon'

interface LikeButtonProps {
  postId: string
  small?: boolean
}

export default function LikeButton({ postId, small }: LikeButtonProps) {
  const { user } = useAuth()
  const toast = useToast()
  const { data } = useLikes(postId, user?.id)
  const toggle = useToggleLike(postId)

  const liked = data?.liked ?? false
  const count = data?.count ?? 0

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) { toast('Inicia sesión para dar like.'); return }
    try {
      await toggle.mutateAsync({ userId: user.id, liked })
    } catch {
      toast('⚠ No se pudo procesar el like.')
    }
  }

  return (
    <button
      className={`post-action ${liked ? 'active' : ''}`}
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-label={liked ? 'Quitar like' : 'Dar like'}
      style={small ? { fontSize: 12, padding: '4px 8px' } : undefined}
    >
      <Icon name="heart" size={14} /> {count > 0 && <span>{count}</span>}
    </button>
  )
}
