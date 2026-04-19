import { useAuth } from '../../features/auth/AuthContext'
import { useBookmark, useToggleBookmark } from '../../features/interactions/useBookmarks'
import { useToast } from '../ui/Toast'
import Icon from '../ui/Icon'

interface BookmarkButtonProps {
  postId: string
}

export default function BookmarkButton({ postId }: BookmarkButtonProps) {
  const { user } = useAuth()
  const toast = useToast()
  const { data } = useBookmark(postId, user?.id)
  const toggle = useToggleBookmark(postId)

  const bookmarked = data?.bookmarked ?? false

  const handleClick = async () => {
    if (!user) { toast('Inicia sesión para guardar posts.'); return }
    try {
      await toggle.mutateAsync({ userId: user.id, bookmarked })
      toast(bookmarked ? 'Post eliminado de favoritos.' : '★ Guardado en favoritos.')
    } catch {
      toast('⚠ No se pudo guardar el post.')
    }
  }

  return (
    <button
      className={`post-action ${bookmarked ? 'active' : ''}`}
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-label={bookmarked ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      <Icon name="star" size={14} /> {bookmarked ? 'Guardado' : 'Guardar'}
    </button>
  )
}
