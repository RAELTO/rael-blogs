import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, MessageCircle, Send } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile } from '../../features/profile/useProfile'
import { useComments, useCreateComment, useDeleteComment } from '../../features/comments/useComments'
import { useCommentVoteDetails } from '../../features/comments/useCommentVotes'
import { useCommentReactionDetails } from '../../features/comments/useCommentReactions'
import Avatar from '../ui/Avatar'
import CommentItem from './CommentItem'
import ActivityModal, { type ActivityRow } from './ActivityModal'
import type { ReactionType, VoteType } from '../../types/database'

function CommentActivityModal({ commentId, onClose }: { commentId: string; onClose: () => void }) {
  const { data: votes     = [], isLoading: vl } = useCommentVoteDetails(commentId, true)
  const { data: reactions = [], isLoading: rl } = useCommentReactionDetails(commentId, true)

  const likeCount    = votes.filter(v => v.vote === 'like').length
  const dislikeCount = votes.filter(v => v.vote === 'dislike').length

  const mergedMap = new Map<string, ActivityRow>()
  for (const v of votes) mergedMap.set(v.user_id, { userId: v.user_id, displayName: v.profiles.display_name, username: v.profiles.username, avatarUrl: v.profiles.avatar_url, role: v.profiles.role, vote: v.vote as VoteType })
  for (const r of reactions) {
    const ex = mergedMap.get(r.user_id)
    if (ex) ex.reaction = r.reaction_type as ReactionType
    else mergedMap.set(r.user_id, { userId: r.user_id, displayName: r.profiles.display_name, username: r.profiles.username, avatarUrl: r.profiles.avatar_url, role: r.profiles.role, reaction: r.reaction_type as ReactionType })
  }

  const allRows      = Array.from(mergedMap.values())
  const likeRows     = votes.map(v => ({ userId: v.user_id, displayName: v.profiles.display_name, username: v.profiles.username, avatarUrl: v.profiles.avatar_url, role: v.profiles.role, vote: v.vote as VoteType }))
  const reactionRows = reactions.map(r => ({ userId: r.user_id, displayName: r.profiles.display_name, username: r.profiles.username, avatarUrl: r.profiles.avatar_url, role: r.profiles.role, reaction: r.reaction_type as ReactionType }))

  return (
    <ActivityModal
      allRows={allRows}
      likeRows={likeRows}
      reactionRows={reactionRows}
      likeCount={likeCount}
      dislikeCount={dislikeCount}
      isLoading={vl || rl}
      onClose={onClose}
    />
  )
}

// ─── Main CommentsModal ───────────────────────────────────────────────────────────
interface Props {
  boxId: string
  onClose: () => void
}

export default function CommentsModal({ boxId, onClose }: Props) {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const { data: comments = [], isLoading } = useComments(boxId)
  const createComment = useCreateComment(boxId)
  const deleteComment = useDeleteComment(boxId)

  const [text, setText] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [activityCommentId, setActivityCommentId] = useState<string | null>(null)
  const [sort, setSort] = useState<'default' | 'recent' | 'relevant'>('default')
  const listRef = useRef<HTMLDivElement>(null)

  // Sorted comments
  const sortedComments = (() => {
    const arr = [...comments]
    if (sort === 'recent')   return arr.reverse()
    if (sort === 'relevant') return arr.sort((a, b) => (b.engagement_count ?? 0) - (a.engagement_count ?? 0))
    return arr
  })()

  // Auto-scroll to bottom only on default sort (chronological)
  useEffect(() => {
    if (sort === 'default' && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [comments.length, sort])

  async function handleSend() {
    if (!text.trim() || !user) return
    await createComment.mutateAsync({ authorId: user.id, content: text.trim() })
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return createPortal(
    <>
      <div
        className="comments-modal-overlay"
        style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={onClose}
      >
        <div
          className="comments-modal-panel"
          style={{ background: 'var(--bg-panel)', border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', width: '100%', maxWidth: 600, height: '82vh', display: 'flex', flexDirection: 'column' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: '3px solid var(--ink)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700 }}>
              ▓ COMENTARIOS · {comments.length}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink)' }}>
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Filter bar — only when there are comments */}
          {comments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, rowGap: 4, padding: '7px 12px', borderBottom: '2px solid var(--ink)', flexShrink: 0, background: 'var(--bg-alt)', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', color: 'var(--ink-mute)', textTransform: 'uppercase', marginRight: 2 }}>
                Ordenar:
              </span>
              {(['default', 'recent', 'relevant'] as const).map(s => {
                const label = s === 'default' ? 'Cronológico' : s === 'recent' ? 'Recientes' : 'Relevantes'
                const isActive = sort === s
                return (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    style={{
                      padding: '3px 9px', border: '2px solid var(--ink)',
                      background: isActive ? 'var(--ink)' : 'var(--bg-panel)',
                      color: isActive ? 'var(--bg-panel)' : 'var(--ink)',
                      cursor: 'pointer', fontWeight: 700, fontSize: 10,
                      fontFamily: 'var(--font-mono)', letterSpacing: '.05em',
                      boxShadow: isActive ? 'none' : '2px 2px 0 var(--ink)',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
              {sort !== 'default' && (
                <button
                  onClick={() => setSort('default')}
                  style={{ padding: '3px 8px', border: '2px solid var(--ink)', background: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', marginLeft: 2 }}
                  title="Limpiar filtro"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Comments list */}
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'visible' }}>
            {isLoading && (
              <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>
                ▒ cargando comentarios...
              </div>
            )}

            {/* Empty state */}
            {!isLoading && comments.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 12 }}>
                <MessageCircle size={64} strokeWidth={1.5} style={{ color: 'var(--ink-mute)', opacity: 0.4 }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em', textAlign: 'center' }}>
                  Sin comentarios aún
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)', textAlign: 'center', letterSpacing: '.03em' }}>
                  Sé el primero en comentar.
                </div>
              </div>
            )}

            {/* Comment items */}
            {sortedComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={user?.id === comment.author_id ? (id) => deleteComment.mutate(id) : undefined}
                onOpenActivity={(id) => setActivityCommentId(id)}
              />
            ))}
          </div>

          {/* Input area */}
          <div style={{ borderTop: '3px solid var(--ink)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0, background: 'var(--bg-alt)' }}>
            {user
              ? <Avatar name={profile?.display_name ?? user.email ?? 'U'} src={profile?.avatar_url} size="sm" />
              : <div style={{ width: 32, height: 32, border: '2px solid var(--ink)', background: 'var(--bg-alt)', flexShrink: 0 }} />
            }
            <div style={{
              flex: 1, border: '2px solid var(--ink)', background: user ? 'var(--bg-panel)' : '#f0f0f0',
              display: 'flex', alignItems: 'flex-end',
              boxShadow: inputFocused && user ? '3px 3px 0 var(--accent-1)' : 'none',
              transform: inputFocused && user ? 'translate(-1px, -1px)' : 'none',
              transition: 'box-shadow .1s, transform .1s',
              opacity: user ? 1 : 0.6,
            }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                disabled={!user}
                placeholder={user ? `Comentar como ${profile?.display_name ?? 'tú'}…` : 'Inicia sesión para comentar…'}
                rows={1}
                style={{
                  flex: 1, border: 'none', outline: 'none', resize: 'none',
                  padding: '10px 12px', fontSize: 14, lineHeight: 1.5,
                  fontFamily: 'var(--font-body)', background: 'transparent',
                  color: 'var(--ink)', maxHeight: 100, overflowY: 'auto',
                  boxShadow: 'none', transform: 'none',
                  cursor: user ? 'text' : 'not-allowed',
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!user || !text.trim() || createComment.isPending}
              className={`comment-send-btn${(!user || !text.trim()) ? ' disabled' : ''}`}
              title={!user ? 'Inicia sesión para comentar' : undefined}
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Auth prompt for guests */}
          {!user && (
            <div style={{
              padding: '8px 16px', background: 'var(--bg-alt)', borderTop: '2px dashed var(--ink)',
              textAlign: 'center', fontSize: 11, fontFamily: 'var(--font-mono)',
              color: 'var(--ink-mute)', letterSpacing: '.04em',
            }}>
              <a href="/login" style={{ color: 'var(--accent-1)', fontWeight: 800, textDecoration: 'underline' }}>
                Inicia sesión
              </a>
              {' '}para participar en la conversación
            </div>
          )}
        </div>
      </div>

      {/* Comment activity modal */}
      {activityCommentId && (
        <CommentActivityModal
          commentId={activityCommentId}
          onClose={() => setActivityCommentId(null)}
        />
      )}
    </>,
    document.body
  )
}
