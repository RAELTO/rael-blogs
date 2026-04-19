import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useIsAdmin } from '../../features/auth/useIsAdmin'
import { useComments, useCreateComment, useDeleteComment } from '../../features/interactions/useComments'
import { formatDate } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import AdminBadge from '../ui/AdminBadge'
import Icon from '../ui/Icon'
import { useToast } from '../ui/Toast'

interface CommentSectionProps {
  postId: string
  postAuthorId?: string
}

export default function CommentSection({ postId, postAuthorId }: CommentSectionProps) {
  const { user } = useAuth()
  const isAdmin = useIsAdmin()
  const toast = useToast()
  const [text, setText] = useState('')
  const [authorInput, setAuthorInput] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setAuthorFilter(authorInput), 400)
    return () => clearTimeout(t)
  }, [authorInput])

  const { data: comments = [], isLoading } = useComments(postId, authorFilter)
  const createComment = useCreateComment(postId)
  const deleteComment = useDeleteComment(postId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !text.trim()) return
    try {
      await createComment.mutateAsync({ content: text.trim(), authorId: user.id })
      setText('')
    } catch (err: unknown) {
      toast(`⚠ ${err instanceof Error ? err.message : 'Error al comentar'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este comentario?')) return
    try {
      await deleteComment.mutateAsync(id)
    } catch {
      toast('⚠ No se pudo eliminar el comentario.')
    }
  }

  const displayName = user?.user_metadata?.display_name ?? user?.email ?? ''

  return (
    <div style={{ marginTop: 48 }}>
      <div className="row between items-center wrap gap-3 mb-5">
        <h2 className="section-title" style={{ margin: 0 }}>
          ▸ Comentarios {comments.length > 0 && `(${comments.length})`}
        </h2>
        <div style={{ position: 'relative', width: 220 }}>
          <input
            placeholder="Filtrar por autor…"
            value={authorInput}
            onChange={e => setAuthorInput(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 13, padding: '8px 10px 8px 32px' }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none', color: 'var(--ink-mute)' }}>⌕</span>
          {authorInput && (
            <button
              type="button"
              onClick={() => setAuthorInput('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-mute)', padding: 0 }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Form */}
      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Avatar name={displayName} size="md" src={user.user_metadata?.avatar_url} />
            <div style={{ flex: 1 }}>
              <textarea
                rows={3}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Escribe algo…"
                maxLength={2000}
                style={{ marginBottom: 8, width: '100%' }}
              />
              <div className="row between items-center">
                <span className="text-xs text-mute">{text.length}/2000</span>
                <button
                  type="submit"
                  className="btn btn-primary btn-small"
                  disabled={!text.trim() || createComment.isPending}
                >
                  {createComment.isPending ? '▒ enviando...' : '↑ Comentar'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="panel mb-5" style={{ padding: 20, textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>
            <Link to="/login" style={{ color: 'var(--accent-1)', fontWeight: 700 }}>Inicia sesión</Link> para comentar.
          </span>
        </div>
      )}

      {/* List */}
      {isLoading && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
          ▒ cargando comentarios...
        </div>
      )}

      {!isLoading && comments.length === 0 && !authorFilter && (
        <div className="panel" style={{ padding: 28, textAlign: 'center', color: 'var(--ink-mute)', fontSize: 14 }}>
          Sin comentarios aún. ¡Sé el primero!
        </div>
      )}
      {!isLoading && comments.length === 0 && authorFilter && (
        <div className="panel" style={{ padding: 28, textAlign: 'center', color: 'var(--ink-mute)', fontSize: 14 }}>
          Ningún comentario de "<strong>{authorFilter}</strong>".
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {comments.map(c => (
          <div key={c.id} className="comment">
            <Avatar name={c.author.display_name} size="sm" src={c.author.avatar_url} />
            <div className="comment-body">
              <div className="comment-meta">
                <span style={{ fontWeight: 700 }}>{c.author.display_name}</span>
                {c.author.role === 'admin' && <AdminBadge />}
                {postAuthorId && c.author_id === postAuthorId && (
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--accent-2)', border: '1.5px solid var(--ink)', padding: '1px 6px', marginLeft: 6 }}>
                    autor
                  </span>
                )}
                <span> · @{c.author.username} · {formatDate(c.created_at)}</span>
                {user && (c.author_id === user.id || isAdmin) && (
                  <button
                    className="btn btn-ghost btn-small"
                    style={{ color: 'var(--accent-1)', fontSize: 11, marginLeft: 'auto', border: '1.5px solid var(--accent-1)' }}
                    onClick={() => handleDelete(c.id)}
                    disabled={deleteComment.isPending}
                    title={isAdmin && c.author_id !== user.id ? 'Eliminar (admin)' : 'Eliminar'}
                  >
                    <Icon name="trash" size={12} />
                  </button>
                )}
              </div>
              <p className="comment-text">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
