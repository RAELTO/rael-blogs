import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { ReactionType, VoteType } from '../../types/database'

const CUSTOM_REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'loud', emoji: '❤️', label: 'Love it' },
  { type: 'fire', emoji: '😆', label: 'Haha' },
  { type: 'sharp', emoji: '😮', label: 'Wow' },
  { type: 'save', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
]

interface BoxEngagementBarProps {
  boxId: string
  isAuthenticated: boolean
  myReaction: ReactionType | null | undefined
  myVote: VoteType | null | undefined
  reactionCounts: Record<ReactionType, number> | undefined
  voteCounts: Record<VoteType, number> | undefined
  commentCount: number
  shareCount: number
  onReact: (reaction: ReactionType) => void
  onVote: (vote: VoteType) => void
  onRequireAuth: () => void
  onOpenReactionDetails: () => void
  onOpenCommentStats: () => void
  onComment: () => void
  onShare: () => void
}

export default function BoxEngagementBar({
  boxId,
  isAuthenticated,
  myReaction,
  myVote,
  reactionCounts,
  voteCounts,
  commentCount,
  shareCount,
  onReact,
  onVote,
  onRequireAuth,
  onOpenReactionDetails,
  onOpenCommentStats,
  onComment,
  onShare,
}: BoxEngagementBarProps) {
  const [votePopoverOpen, setVotePopoverOpen] = useState(false)
  const [reactionPopoverOpen, setReactionPopoverOpen] = useState(false)
  const voteCloseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reactionCloseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => {
    clearTimeout(voteCloseTimer.current)
    clearTimeout(reactionCloseTimer.current)
  }, [])

  const customReaction = CUSTOM_REACTIONS.find((reaction) => reaction.type === myReaction)
  const hasLike = myVote === 'like'
  const hasDislike = myVote === 'dislike'
  const topCustom = reactionCounts
    ? CUSTOM_REACTIONS
        .reduce<Array<(typeof CUSTOM_REACTIONS)[number] & { count: number }>>((items, reaction) => {
          const count = reactionCounts[reaction.type] ?? 0
          if (count > 0) items.push({ ...reaction, count })
          return items
        }, [])
        .sort((first, second) => second.count - first.count)
    : []
  const totalCustom = topCustom.reduce((sum, reaction) => sum + reaction.count, 0)

  function openVotePopover() {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    setReactionPopoverOpen(false)
    setVotePopoverOpen(true)
  }

  function openReactionPopover() {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    setVotePopoverOpen(false)
    setReactionPopoverOpen(true)
  }

  return (
    <>
      <div className="box-stats">
        <button
          type="button"
          className="box-stats-btn"
          onClick={onOpenReactionDetails}
          title="View reactions"
        >
          <span className="box-stats-emojis">
            {topCustom.slice(0, 3).map((reaction) => (
              <span key={reaction.type} className="box-stats-emoji">{reaction.emoji}</span>
            ))}
            {topCustom.length > 3 && <span className="box-stats-more">…</span>}
            <span className="box-stats-count">{totalCustom}</span>
          </span>
          <span className="box-stat-vote">
            <ThumbsUp size={12} strokeWidth={2.5} className="box-like-icon" />
            <span>{voteCounts?.like ?? 0}</span>
          </span>
          <span className="box-stat-vote">
            <ThumbsDown size={12} strokeWidth={2.5} className="box-dislike-icon" />
            <span>{voteCounts?.dislike ?? 0}</span>
          </span>
        </button>

        <button type="button" className="box-stats-btn box-stats-comments" onClick={onOpenCommentStats}>
          <span className="box-comments-share">
            <span>Comments {commentCount}</span>
            <span>Shares {shareCount}</span>
          </span>
        </button>
      </div>

      <div className="box-actions">
        <div
          className={`box-action box-action-menu${hasLike ? ' active-like' : hasDislike ? ' active-dislike' : ''}`}
          onMouseEnter={() => {
            if (!isAuthenticated) return
            clearTimeout(voteCloseTimer.current)
            setVotePopoverOpen(true)
          }}
          onMouseLeave={() => {
            voteCloseTimer.current = setTimeout(() => setVotePopoverOpen(false), 120)
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setVotePopoverOpen(false)
          }}
        >
          <button
            type="button"
            className="box-action-trigger"
            aria-haspopup="menu"
            aria-expanded={votePopoverOpen}
            aria-controls={`vote-popover-${boxId}`}
            onClick={openVotePopover}
          >
            {hasLike ? (
              <><ThumbsUp size={15} strokeWidth={2.5} /><span>Like</span></>
            ) : hasDislike ? (
              <><ThumbsDown size={15} strokeWidth={2.5} /><span>Dislike</span></>
            ) : (
              <><ThumbsUp size={13} strokeWidth={2} /><ThumbsDown size={13} strokeWidth={2} /><span className="box-vote-label">Like/Dislike</span></>
            )}
          </button>

          {votePopoverOpen && (
            <div
              id={`vote-popover-${boxId}`}
              className="reactions-pop"
              role="menu"
              aria-label="Vote on this post"
              onMouseEnter={() => clearTimeout(voteCloseTimer.current)}
              onMouseLeave={() => {
                voteCloseTimer.current = setTimeout(() => setVotePopoverOpen(false), 120)
              }}
            >
              <button
                type="button"
                className={`react-btn vote-like${hasLike ? ' active' : ''}`}
                title="Like"
                aria-label="Like"
                role="menuitemradio"
                aria-checked={hasLike}
                onClick={() => { onVote('like'); setVotePopoverOpen(false) }}
              >
                <ThumbsUp size={18} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                className={`react-btn vote-dislike${hasDislike ? ' active' : ''}`}
                title="Dislike"
                aria-label="Dislike"
                role="menuitemradio"
                aria-checked={hasDislike}
                onClick={() => { onVote('dislike'); setVotePopoverOpen(false) }}
              >
                <ThumbsDown size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        <div
          className={`box-action box-action-menu${customReaction ? ' active-react' : ''}`}
          onMouseEnter={() => {
            if (!isAuthenticated) return
            clearTimeout(reactionCloseTimer.current)
            setReactionPopoverOpen(true)
          }}
          onMouseLeave={() => {
            reactionCloseTimer.current = setTimeout(() => setReactionPopoverOpen(false), 120)
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setReactionPopoverOpen(false)
          }}
        >
          <button
            type="button"
            className="box-action-trigger"
            aria-haspopup="menu"
            aria-expanded={reactionPopoverOpen}
            aria-controls={`reaction-popover-${boxId}`}
            onClick={openReactionPopover}
          >
            <span className="box-reaction-emoji">{customReaction?.emoji ?? '😀'}</span>
            <span>{customReaction?.label ?? 'Reaction'}</span>
          </button>

          {reactionPopoverOpen && isAuthenticated && (
            <div
              id={`reaction-popover-${boxId}`}
              className="reactions-pop"
              role="menu"
              aria-label="React to this post"
              onMouseEnter={() => clearTimeout(reactionCloseTimer.current)}
              onMouseLeave={() => {
                reactionCloseTimer.current = setTimeout(() => setReactionPopoverOpen(false), 120)
              }}
            >
              {CUSTOM_REACTIONS.map((reaction) => (
                <button
                  type="button"
                  key={reaction.type}
                  className={`react-btn${myReaction === reaction.type ? ' active' : ''}`}
                  title={reaction.label}
                  aria-label={reaction.label}
                  role="menuitemradio"
                  aria-checked={myReaction === reaction.type}
                  onClick={() => { onReact(reaction.type); setReactionPopoverOpen(false) }}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="box-action" onClick={onComment}>
          <MessageCircle size={15} strokeWidth={2.5} />
          <span>Comment</span>
        </button>

        <button type="button" className="box-action" onClick={onShare}>
          <Share2 size={15} strokeWidth={2.5} />
          <span>Share</span>
        </button>
      </div>
    </>
  )
}
