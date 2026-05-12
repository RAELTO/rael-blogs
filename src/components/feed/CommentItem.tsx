import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useMyCommentVote, useCommentVoteCounts, useToggleCommentVote } from '../../features/comments/useCommentVotes'
import { useMyCommentReaction, useCommentReactionCounts, useToggleCommentReaction } from '../../features/comments/useCommentReactions'
import Avatar from '../ui/Avatar'
import AdminBadge from '../ui/AdminBadge'
import type { CommentWithAuthor } from '../../features/comments/useComments'
import type { ReactionType, VoteType } from '../../types/database'

// ─── Config ──────────────────────────────────────────────────────────────────────
const CUSTOM_REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'loud',  emoji: '❤️', label: 'Me encanta' },
  { type: 'fire',  emoji: '😆', label: 'Haha'       },
  { type: 'sharp', emoji: '😮', label: 'Wow'        },
  { type: 'save',  emoji: '😢', label: 'Sad'        },
  { type: 'angry', emoji: '😠', label: 'Angry'      },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

// ─── Props ────────────────────────────────────────────────────────────────────────
interface Props {
  comment: CommentWithAuthor
  onDelete?: (id: string) => void
  onOpenActivity?: (commentId: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────────
export default function CommentItem({ comment, onDelete, onOpenActivity }: Props) {
  const { user } = useAuth()
  const [popPos, setPopPos]   = useState<{ top: number; left: number } | null>(null)
  const triggerRef            = useRef<HTMLDivElement>(null)
  const closeTimer            = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { data: myVote }      = useMyCommentVote(comment.id, user?.id)
  const { data: myReaction }  = useMyCommentReaction(comment.id, user?.id)
  const { data: voteCounts }  = useCommentVoteCounts(comment.id)
  const { data: reactCounts } = useCommentReactionCounts(comment.id)
  const toggleVote            = useToggleCommentVote(comment.id)
  const toggleReaction        = useToggleCommentReaction(comment.id)

  const likeCount    = voteCounts?.like    ?? 0
  const dislikeCount = voteCounts?.dislike ?? 0
  const topReactions = CUSTOM_REACTIONS
    .map(r => ({ ...r, n: reactCounts?.[r.type] ?? 0 }))
    .filter(r => r.n > 0)
    .sort((a, b) => b.n - a.n)
  const totalReactions = topReactions.reduce((s, r) => s + r.n, 0)

  const hasActivity = likeCount > 0 || dislikeCount > 0 || totalReactions > 0

  function handleVote(vote: VoteType) {
    if (!user) return
    toggleVote.mutate({ userId: user.id, vote, current: myVote ?? null })
  }

  function handleReact(type: ReactionType) {
    if (!user) return
    toggleReaction.mutate({ userId: user.id, type, current: myReaction ?? null })
    setPopPos(null)
  }

  function openPopover() {
    clearTimeout(closeTimer.current)
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // popup: 2 votes(36px) + divider + 5 emojis(36px) + gaps + padding ≈ 312px
      const POPUP_W = 312
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPUP_W - 8))
      setPopPos({ top: rect.top - 60, left })
    }
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setPopPos(null), 120)
  }

  const isOwner = user?.id === comment.author_id

  return (
    <>
      <div style={{ display: 'flex', gap: 10, padding: '12px 18px', borderBottom: '2px solid var(--ink)' }}>
        {/* Avatar */}
        <Link to={`/profile/${comment.author.username}`} style={{ display: 'flex', textDecoration: 'none' }}>
          <Avatar name={comment.author.display_name} src={comment.author.avatar_url} size="sm" />
        </Link>

        {/* Bubble */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: 'var(--bg-alt)',
            border: '2px solid var(--ink)',
            boxShadow: '3px 3px 0 var(--ink)',
            padding: '8px 12px',
            marginBottom: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <Link
                to={`/profile/${comment.author.username}`}
                style={{ fontWeight: 800, fontSize: 13, color: 'inherit', textDecoration: 'none' }}
              >
                {comment.author.display_name}
                {comment.author.role === 'admin' && <AdminBadge />}
              </Link>
              {isOwner && onDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--ink-mute)', display: 'flex' }}
                  title="Eliminar"
                >
                  <Trash2 size={12} strokeWidth={2} />
                </button>
              )}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 4 }}>
            {/* Time */}
            <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
              {timeAgo(comment.created_at)}
            </span>

            {/* Vote buttons */}
            <button
              onClick={() => handleVote('like')}
              style={{
                background: myVote === 'like' ? 'var(--accent-4)' : 'none',
                border: 'none', cursor: 'pointer', padding: '2px 6px',
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: 'var(--ink)',
              }}
              title="Like"
            >
              <ThumbsUp size={11} strokeWidth={2.5} style={{ color: 'var(--accent-4)' }} />
              {likeCount > 0 && likeCount}
            </button>

            <button
              onClick={() => handleVote('dislike')}
              style={{
                background: myVote === 'dislike' ? 'var(--accent-1)' : 'none',
                border: 'none', cursor: 'pointer', padding: '2px 6px',
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: myVote === 'dislike' ? 'var(--bg-panel)' : 'var(--ink)',
              }}
              title="Dislike"
            >
              <ThumbsDown size={11} strokeWidth={2.5} style={{ color: myVote === 'dislike' ? 'var(--bg-panel)' : 'var(--accent-1)' }} />
              {dislikeCount > 0 && dislikeCount}
            </button>

            {/* Reaction hover trigger */}
            <div
              ref={triggerRef}
              onMouseEnter={openPopover}
              onMouseLeave={scheduleClose}
              style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', position: 'relative' }}
            >
              {myReaction
                ? <span style={{ fontSize: 13 }}>{CUSTOM_REACTIONS.find(r => r.type === myReaction)?.emoji ?? '😀'}</span>
                : <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}>Reaccionar</span>
              }
            </div>

            {/* Reaction summary (clickable) */}
            {hasActivity && (
              <button
                onClick={() => onOpenActivity?.(comment.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 3,
                  fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)',
                  marginLeft: 'auto', padding: 0,
                }}
              >
                {topReactions.slice(0, 2).map(r => (
                  <span key={r.type} style={{ fontSize: 12 }}>{r.emoji}</span>
                ))}
                {(likeCount + dislikeCount + totalReactions)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reaction popover — portal so it's never clipped by overflow */}
      {popPos && createPortal(
        <div
          style={{
            position: 'fixed', top: popPos.top, left: popPos.left, zIndex: 9100,
            display: 'flex', gap: 4, padding: '6px 8px',
            background: 'var(--bg-panel)', border: '2px solid var(--ink)',
            boxShadow: '4px 4px 0 var(--ink)',
          }}
          onMouseEnter={() => clearTimeout(closeTimer.current)}
          onMouseLeave={scheduleClose}
        >
          {/* Like/Dislike mini buttons */}
          <button
            onClick={() => handleVote('like')}
            style={{
              width: 36, height: 36, border: '2px solid var(--ink)',
              background: myVote === 'like' ? 'var(--accent-4)' : 'var(--bg-panel)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 0 var(--ink)', transition: 'transform .08s',
            }}
            title="Like"
          >
            <ThumbsUp size={15} strokeWidth={2.5} style={{ color: 'var(--accent-4)' }} />
          </button>
          <button
            onClick={() => handleVote('dislike')}
            style={{
              width: 36, height: 36, border: '2px solid var(--ink)',
              background: myVote === 'dislike' ? 'var(--accent-1)' : 'var(--bg-panel)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 0 var(--ink)',
            }}
            title="Dislike"
          >
            <ThumbsDown size={15} strokeWidth={2.5} style={{ color: 'var(--accent-1)' }} />
          </button>

          {/* Divider */}
          <div style={{ width: 2, background: 'var(--ink)', margin: '4px 2px' }} />

          {/* Emoji reactions */}
          {CUSTOM_REACTIONS.map(r => (
            <button
              key={r.type}
              onClick={() => handleReact(r.type)}
              title={r.label}
              style={{
                width: 36, height: 36, border: '2px solid var(--ink)',
                background: myReaction === r.type ? 'var(--accent-2)' : 'var(--bg-panel)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, boxShadow: '2px 2px 0 var(--ink)', transition: 'transform .08s',
              }}
            >
              {r.emoji}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
