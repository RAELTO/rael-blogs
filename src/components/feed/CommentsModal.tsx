import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, MessageCircle, Send } from 'lucide-react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile } from '../../features/profile/useProfile'
import { useComments, useCreateComment, useDeleteComment } from '../../features/comments/useComments'
import { useCommentVoteDetails } from '../../features/comments/useCommentVotes'
import { useCommentReactionDetails } from '../../features/comments/useCommentReactions'
import Avatar from '../ui/Avatar'
import CommentItem from './CommentItem'

// ─── Comment Activity Modal (who reacted to a specific comment) ──────────────────
const REACTION_META: Record<string, { emoji: string; label: string }> = {
  bold:  { emoji: '👍', label: 'Me gusta'   },
  loud:  { emoji: '❤️', label: 'Me encanta' },
  fire:  { emoji: '😆', label: 'Haha'       },
  sharp: { emoji: '😮', label: 'Wow'        },
  save:  { emoji: '😢', label: 'Sad'        },
  angry: { emoji: '😠', label: 'Angry'      },
}

function CommentActivityModal({ commentId, onClose }: { commentId: string; onClose: () => void }) {
  const [tab, setTab] = useState<'all' | 'likes' | 'reactions'>('all')
  const { data: votes     = [], isLoading: vl } = useCommentVoteDetails(commentId, true)
  const { data: reactions = [], isLoading: rl } = useCommentReactionDetails(commentId, true)

  const likeCount    = votes.filter(v => v.vote === 'like').length
  const dislikeCount = votes.filter(v => v.vote === 'dislike').length

  type MRow = { userId: string; displayName: string; username: string; avatarUrl: string | null; vote?: string; reaction?: string }

  // Merge by user_id for "Todos"
  const mergedMap = new Map<string, MRow>()
  for (const v of votes) mergedMap.set(v.user_id, { userId: v.user_id, displayName: v.profiles.display_name, username: v.profiles.username, avatarUrl: v.profiles.avatar_url, vote: v.vote })
  for (const r of reactions) {
    const ex = mergedMap.get(r.user_id)
    if (ex) ex.reaction = r.reaction_type
    else mergedMap.set(r.user_id, { userId: r.user_id, displayName: r.profiles.display_name, username: r.profiles.username, avatarUrl: r.profiles.avatar_url, reaction: r.reaction_type })
  }

  const allRows: MRow[]      = Array.from(mergedMap.values())
  const displayedRows: MRow[] = tab === 'all' ? allRows
    : tab === 'likes' ? votes.map(v => ({ userId: v.user_id, displayName: v.profiles.display_name, username: v.profiles.username, avatarUrl: v.profiles.avatar_url, vote: v.vote }))
    : reactions.map(r => ({ userId: r.user_id, displayName: r.profiles.display_name, username: r.profiles.username, avatarUrl: r.profiles.avatar_url, reaction: r.reaction_type }))

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9200, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-panel)', border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', width: '100%', maxWidth: 420, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '3px solid var(--ink)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700 }}>▓ ACTIVIDAD · {allRows.length}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: 'var(--accent-4)', fontFamily: 'var(--font-mono)' }}><ThumbsUp size={11} strokeWidth={2.5}/> {likeCount}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: 'var(--accent-1)', fontFamily: 'var(--font-mono)' }}><ThumbsDown size={11} strokeWidth={2.5}/> {dislikeCount}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink)' }}><X size={16} strokeWidth={2.5} /></button>
        </div>
        <div style={{ display: 'flex', borderBottom: '3px solid var(--ink)' }}>
          {(['all','likes','reactions'] as const).map((t, i) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '9px 4px', border: 'none', borderRight: i < 2 ? '2px solid var(--ink)' : 'none', background: tab === t ? 'var(--ink)' : 'none', color: tab === t ? 'var(--bg-panel)' : 'var(--ink)', cursor: 'pointer', fontWeight: 800, fontSize: 11, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              {t === 'all' ? 'Todos' : t === 'likes' ? 'Likes' : 'Reacciones'}
              <span style={{ background: 'var(--bg-alt)', color: 'var(--ink)', padding: '1px 5px', fontSize: 10, fontWeight: 900, border: '1px solid var(--ink)' }}>
                {t === 'all' ? allRows.length : t === 'likes' ? votes.length : reactions.length}
              </span>
            </button>
          ))}
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {(vl || rl) && <div style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>▒ cargando...</div>}
          {!vl && !rl && displayedRows.length === 0 && <div style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>Sin actividad aún</div>}
          {displayedRows.map((row, i) => (
            <div key={`${row.userId}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '2px solid var(--ink)' }}>
              <Avatar name={row.displayName} src={row.avatarUrl} size="sm" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{row.displayName}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>@{row.username}</div>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {row.vote && <div style={{ width: 26, height: 26, border: '2px solid var(--ink)', background: row.vote === 'like' ? 'var(--accent-4)' : 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 var(--ink)' }}>{row.vote === 'like' ? <ThumbsUp size={12} strokeWidth={2.5}/> : <ThumbsDown size={12} strokeWidth={2.5}/>}</div>}
                {row.reaction && <div style={{ width: 26, height: 26, border: '2px solid var(--ink)', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, boxShadow: '2px 2px 0 var(--ink)' }}>{REACTION_META[row.reaction]?.emoji}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
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
