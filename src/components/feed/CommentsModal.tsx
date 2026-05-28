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
  const { data: votes = [], isLoading: votesLoading } = useCommentVoteDetails(commentId, true)
  const { data: reactions = [], isLoading: reactionsLoading } = useCommentReactionDetails(commentId, true)

  const likeCount = votes.filter(v => v.vote === 'like').length
  const dislikeCount = votes.filter(v => v.vote === 'dislike').length

  const mergedMap = new Map<string, ActivityRow>()
  for (const v of votes) {
    mergedMap.set(v.user_id, {
      userId: v.user_id,
      displayName: v.profiles.display_name,
      username: v.profiles.username,
      avatarUrl: v.profiles.avatar_url,
      role: v.profiles.role,
      vote: v.vote as VoteType,
    })
  }
  for (const r of reactions) {
    const existing = mergedMap.get(r.user_id)
    if (existing) existing.reaction = r.reaction_type as ReactionType
    else {
      mergedMap.set(r.user_id, {
        userId: r.user_id,
        displayName: r.profiles.display_name,
        username: r.profiles.username,
        avatarUrl: r.profiles.avatar_url,
        role: r.profiles.role,
        reaction: r.reaction_type as ReactionType,
      })
    }
  }

  const allRows = Array.from(mergedMap.values())
  const likeRows = votes.map(v => ({ userId: v.user_id, displayName: v.profiles.display_name, username: v.profiles.username, avatarUrl: v.profiles.avatar_url, role: v.profiles.role, vote: v.vote as VoteType }))
  const reactionRows = reactions.map(r => ({ userId: r.user_id, displayName: r.profiles.display_name, username: r.profiles.username, avatarUrl: r.profiles.avatar_url, role: r.profiles.role, reaction: r.reaction_type as ReactionType }))

  return (
    <ActivityModal
      allRows={allRows}
      likeRows={likeRows}
      reactionRows={reactionRows}
      likeCount={likeCount}
      dislikeCount={dislikeCount}
      isLoading={votesLoading || reactionsLoading}
      onClose={onClose}
    />
  )
}

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

  const sortedComments = (() => {
    const arr = [...comments]
    if (sort === 'recent') return arr.reverse()
    if (sort === 'relevant') return arr.sort((a, b) => (b.engagement_count ?? 0) - (a.engagement_count ?? 0))
    return arr
  })()

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
        style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)' as unknown as number, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={onClose}
      >
        <div
          className="comments-modal-panel"
          style={{ background: 'var(--bg-panel)', border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', width: '100%', maxWidth: 600, height: '82vh', display: 'flex', flexDirection: 'column' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="comments-modal-header">
            <span className="comments-modal-title">COMMENTS - {comments.length}</span>
            <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close comments">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {comments.length > 0 && (
            <div className="comments-sort-bar">
              <span className="comments-sort-label">Sort:</span>
              {(['default', 'recent', 'relevant'] as const).map(s => {
                const label = s === 'default' ? 'Oldest' : s === 'recent' ? 'Newest' : 'Top'
                return (
                  <button type="button"
                    key={s}
                    onClick={() => setSort(s)}
                    className={`comments-sort-btn${sort === s ? ' active' : ''}`}
                  >
                    {label}
                  </button>
                )
              })}
              {sort !== 'default' && (
                <button type="button" onClick={() => setSort('default')} className="comments-sort-clear" title="Clear filter">
                  X
                </button>
              )}
            </div>
          )}

          <div ref={listRef} className="comments-list">
            {isLoading && (
              <div className="comments-list-loading">loading comments...</div>
            )}

            {!isLoading && comments.length === 0 && (
              <div className="comments-empty-state">
                <MessageCircle size={64} strokeWidth={1.5} className="comments-empty-icon" />
                <div className="comments-empty-title">No comments yet</div>
                <div className="comments-empty-sub">Be the first to comment.</div>
              </div>
            )}

            {sortedComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={user?.id === comment.author_id ? (id) => deleteComment.mutate(id) : undefined}
                onOpenActivity={(id) => setActivityCommentId(id)}
              />
            ))}
          </div>

          <div className="comments-composer">
            {user
              ? <Avatar name={profile?.display_name ?? user.email ?? 'U'} src={profile?.avatar_url} size="sm" />
              : <div className="comments-avatar-placeholder" />
            }
            <div
              className="comments-composer-wrap"
              style={{
                background: user ? 'var(--bg-panel)' : '#f0f0f0',
                boxShadow: inputFocused && user ? '4px 4px 0 var(--accent-1)' : 'none',
                transform: inputFocused && user ? 'translate(-2px, -2px)' : 'none',
                opacity: user ? 1 : 0.6,
              }}
            >
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                disabled={!user}
                placeholder={user ? `Comment as ${profile?.display_name ?? 'you'}...` : 'Sign in to comment...'}
                rows={1}
                className="comments-composer-textarea"
                style={{ cursor: user ? 'text' : 'not-allowed' }}
              />
            </div>
            <button type="button"
              onClick={handleSend}
              disabled={!user || !text.trim() || createComment.isPending}
              className="comments-composer-send"
              title={!user ? 'Sign in to comment' : undefined}
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </div>

          {!user && (
            <div style={{
              padding: '8px 16px', background: 'var(--bg-alt)', borderTop: '2px dashed var(--ink)',
              textAlign: 'center', fontSize: 11, fontFamily: 'var(--font-mono)',
              color: 'var(--ink-mute)', letterSpacing: '.04em',
            }}>
              <a href="/login" style={{ color: 'var(--accent-1)', fontWeight: 800, textDecoration: 'underline' }}>
                Sign in
              </a>
              {' '}to join the conversation
            </div>
          )}
        </div>
      </div>

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
