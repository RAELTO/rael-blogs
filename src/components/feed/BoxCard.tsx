import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useToast } from '../ui/Toast'
import { useToggleReaction, useMyReaction, useReactionCounts } from '../../features/reactions/useReactions'
import { useToggleVote, useMyVote, useVoteCounts } from '../../features/votes/useVotes'
import Avatar from '../ui/Avatar'
import AdminBadge from '../ui/AdminBadge'
import ReactionsDetailModal from './ReactionsDetailModal'
import CommentsModal from './CommentsModal'
import ShareModal from './ShareModal'
import { useShareCount } from '../../features/shares/useShares'
import type { BoxWithAuthor, ReactionType, VoteType, MediaPayload, PollPayload, MoodPayload, LinkPayload, ThreadPayload } from '../../types/database'

// ─── Reaction config ────────────────────────────────────────────────────────────
const CUSTOM_REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'loud',  emoji: '❤️', label: 'Me encanta' },
  { type: 'fire',  emoji: '😆', label: 'Haha'       },
  { type: 'sharp', emoji: '😮', label: 'Wow'        },
  { type: 'save',  emoji: '😢', label: 'Sad'        },
  { type: 'angry', emoji: '😠', label: 'Angry'      },
]

const MOOD_BG: Record<MoodPayload['color'], string> = {
  m1: '#ff5a5f',
  m2: '#4cc9f0',
  m3: '#c77dff',
  m4: '#6ee7b7',
  m5: '#ffd23f',
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function safeHref(url: string): string {
  try {
    const u = new URL(url)
    return ['http:', 'https:'].includes(u.protocol) ? url : '#'
  } catch { return '#' }
}

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

// ─── Content renderers per box type ────────────────────────────────────────────
function BoxContent({ box }: { box: BoxWithAuthor }) {
  const [voted, setVoted] = useState<string | null>(null)

  if (box.type === 'media') {
    const p = box.payload as unknown as MediaPayload
    if (!p?.url) return null
    if (p.kind === 'video') {
      return (
        <div style={{ borderTop: '3px solid var(--ink)', borderBottom: '3px solid var(--ink)', lineHeight: 0 }}>
          <iframe
            src={p.url}
            style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    return (
      <div style={{ borderTop: '3px solid var(--ink)', borderBottom: '3px solid var(--ink)', lineHeight: 0 }}>
        <img src={p.url} alt={p.caption ?? ''} style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '72vh', objectFit: 'contain' }} />
      </div>
    )
  }

  if (box.type === 'mood') {
    const p = box.payload as unknown as MoodPayload
    return (
      <div className="mood-block" style={{ background: MOOD_BG[p?.color ?? 'm1'] }}>
        <p>{box.content}</p>
      </div>
    )
  }

  if (box.type === 'poll') {
    const p = box.payload as unknown as PollPayload
    if (!p?.options) return null
    const totalVotes = p.options.reduce((s, o) => s + (o.votes ?? 0), 0)
    return (
      <div className="poll-wrap">
        {p.options.map((opt, i) => {
          const pct = totalVotes > 0 ? Math.round(((opt.votes ?? 0) / totalVotes) * 100) : 0
          const isVoted = voted === String(i)
          return (
            <div
              key={i}
              className={`poll-option${isVoted ? ' voted' : ''}`}
              onClick={() => setVoted(String(i))}
            >
              <div className="poll-bar" style={{ width: `${pct}%` }} />
              <span className="poll-label">{opt.text}</span>
              {totalVotes > 0 && <span className="poll-pct">{pct}%</span>}
            </div>
          )
        })}
        <div className="poll-meta">{totalVotes} votos · toca para votar</div>
      </div>
    )
  }

  if (box.type === 'thread') {
    const p = box.payload as unknown as ThreadPayload
    if (!p?.items?.length) return null
    return (
      <div className="thread-wrap">
        {p.items.map((item, i) => (
          <div key={i} className="thread-item">
            <div className="thread-num">{i + 1}</div>
            <span style={{ lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>
    )
  }

  if (box.type === 'link') {
    const p = box.payload as unknown as LinkPayload
    if (!p?.url) return null
    return (
      <div className="link-card">
        {p.thumbnail && (
          <img src={p.thumbnail} alt="" className="link-thumb" />
        )}
        <div className="link-info">
          {p.host && <div className="link-host">{p.host}</div>}
          <a href={safeHref(p.url)} target="_blank" rel="noopener noreferrer" className="link-title">
            {p.title ?? p.url}
          </a>
          {p.description && (
            <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 4, lineHeight: 1.4 }}>
              {p.description}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

// ─── Main component ─────────────────────────────────────────────────────────────
interface BoxCardProps {
  box: BoxWithAuthor
  onDelete?: (id: string) => void
}

export default function BoxCard({ box, onDelete }: BoxCardProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [reactPopOpen, setReactPopOpen]     = useState(false) // Like/Dislike tooltip
  const [emojiPopOpen, setEmojiPopOpen]     = useState(false) // Reacción tooltip
  const [menuOpen, setMenuOpen]             = useState(false)
  const [reactionDetailOpen, setReactionDetailOpen] = useState(false)
  const [commentsOpen, setCommentsOpen]     = useState(false)
  const [shareOpen, setShareOpen]           = useState(false)
  const { data: shareCount = 0 }            = useShareCount(box.id)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined) // for Like/Dislike
  const voteTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined) // for Reacción

  const { data: myReaction } = useMyReaction(box.id, user?.id)
  const { data: myVote }     = useMyVote(box.id, user?.id)
  const toggleReaction = useToggleReaction(box.id)
  const toggleVote     = useToggleVote(box.id)
  const { data: reactionCounts } = useReactionCounts(box.id)
  const { data: voteCounts }     = useVoteCounts(box.id)

  const AUTH_TOAST = '¡Inicia sesión para interactuar con este drop! 🔐'

  function handleReact(type: ReactionType) {
    if (!user) { toast(AUTH_TOAST, 5000); setReactPopOpen(false); setEmojiPopOpen(false); return }
    toggleReaction.mutate({ userId: user.id, type, current: myReaction ?? null })
    setReactPopOpen(false)
    setEmojiPopOpen(false)
  }

  function handleVote(vote: VoteType) {
    if (!user) { toast(AUTH_TOAST, 5000); setReactPopOpen(false); return }
    toggleVote.mutate({ userId: user.id, vote, current: myVote ?? null })
  }

  function openComments() {
    if (!user) { toast(AUTH_TOAST, 5000); return }
    setCommentsOpen(true)
  }

  function openShare() {
    if (!user) { toast(AUTH_TOAST, 5000); return }
    setShareOpen(true)
  }

  const totalComments = box.comment_count ?? 0
  const isOwner = user?.id === box.author_id

  const customReaction = CUSTOM_REACTIONS.find(r => r.type === myReaction)
  const hasLike    = myVote === 'like'
  const hasDislike = myVote === 'dislike'
  const hasCustom  = !!customReaction

  // Compute top 3 custom reactions for emoji stack
  const likeCount    = voteCounts?.like    ?? 0
  const dislikeCount = voteCounts?.dislike ?? 0
  const topCustom = reactionCounts
    ? CUSTOM_REACTIONS
        .map(r => ({ ...r, n: reactionCounts[r.type] ?? 0 }))
        .filter(r => r.n > 0)
        .sort((a, b) => b.n - a.n)
    : []
  const totalCustom = topCustom.reduce((s, r) => s + r.n, 0)

  return (
    <>
      <div className="panel box-card">
        {/* Head */}
        <div className="box-head">
          <Link to={`/profile/${box.author.username}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
            <Avatar name={box.author.display_name} src={box.author.avatar_url} size="md" />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="box-head-name">
              {box.author.display_name}
              {box.author.role === 'admin' && <AdminBadge />}
            </div>
            <div className="box-head-meta">@{box.author.username} · {timeAgo(box.published_at)}</div>
          </div>
          {isOwner && (
            <div style={{ position: 'relative' }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 1, display: 'flex' }}
                onClick={() => setMenuOpen(o => !o)}
              >
                <MoreVertical size={18} strokeWidth={2.5} />
              </button>
              {menuOpen && (
                <div className="panel" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, minWidth: 120, padding: 0 }}>
                  {onDelete && (
                    <button
                      style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', borderBottom: '2px solid var(--ink)', cursor: 'pointer', fontWeight: 700, color: 'var(--accent-1)' }}
                      onClick={() => { onDelete(box.id); setMenuOpen(false) }}
                    >
                      Eliminar
                    </button>
                  )}
                  <button
                    style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text body — shown for all types except mood (mood shows text inside block) */}
        {box.type !== 'mood' && box.content && (
          <div className="box-body">
            <Link to={`/box/${box.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <p className="box-text">{box.content}</p>
            </Link>
          </div>
        )}

        {/* Type-specific content */}
        <BoxContent box={box} />

        {/* Tags */}
        {(box.tags ?? []).length > 0 && (
          <div className="box-tags-row">
            {(box.tags ?? []).map((t: { id: string; name: string; slug: string }) => (
              <Link key={t.id} to={`/tag/${t.slug}`} className="chip" style={{ textDecoration: 'none' }}>
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="box-stats">
          {/* Engagement summary: reactions + votes */}
          <button
            type="button"
            className="box-stats-btn"
            onClick={() => setReactionDetailOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            title="Ver reacciones"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              {topCustom.slice(0, 3).map(r => (
                <span key={r.type} style={{ fontSize: 15, lineHeight: 1 }}>{r.emoji}</span>
              ))}
              {topCustom.length > 3 && <span style={{ fontSize: 12 }}>...</span>}
              <span style={{ marginLeft: 2 }}>{totalCustom}</span>
            </span>
            <span className="box-stat-vote">
              <ThumbsUp size={12} strokeWidth={2.5} style={{ color: 'var(--accent-4)', fill: 'none' }} />
              <span>{likeCount}</span>
            </span>
            <span className="box-stat-vote">
              <ThumbsDown size={12} strokeWidth={2.5} style={{ color: 'var(--accent-1)', fill: 'none' }} />
              <span>{dislikeCount}</span>
            </span>
          </button>

          <button
            className="box-stats-btn"
            onClick={() => setCommentsOpen(true)}
            style={{ marginLeft: 'auto' }}
          >
            {totalComments} comentarios · {shareCount} compartidos
          </button>
        </div>

        {/* Actions — 4 cols: Like/Dislike | Reacción | Comentar | Compartir */}
        <div className="box-actions">
          {/* ① Like/Dislike unified with hover tooltip */}
          <div
            className={`box-action${hasLike ? ' active-like' : hasDislike ? ' active-dislike' : ''}`}
            style={{ position: 'relative' }}
            onMouseEnter={() => { if (!user) return; clearTimeout(closeTimer.current); setReactPopOpen(true) }}
            onMouseLeave={() => { closeTimer.current = setTimeout(() => setReactPopOpen(false), 120) }}
          >
            {hasLike
              ? <><ThumbsUp size={15} strokeWidth={2.5} /><span>Like</span></>
              : hasDislike
              ? <><ThumbsDown size={15} strokeWidth={2.5} /><span>Dislike</span></>
              : <><ThumbsUp size={13} strokeWidth={2} /><ThumbsDown size={13} strokeWidth={2} /><span style={{ fontSize: 11 }}>Like/Dislike</span></>
            }

            {reactPopOpen && (
              <div
                className="reactions-pop"
                style={{ display: 'flex', gap: 6 }}
                onMouseEnter={() => clearTimeout(closeTimer.current)}
                onMouseLeave={() => { closeTimer.current = setTimeout(() => setReactPopOpen(false), 120) }}
              >
                <button
                  className={`react-btn${hasLike ? ' active' : ''}`}
                  title="Like"
                  onClick={() => { if (user) handleVote('like'); setReactPopOpen(false) }}
                  style={{ background: hasLike ? 'var(--accent-4)' : 'var(--bg-panel)' }}
                >
                  <ThumbsUp size={18} strokeWidth={2.5} style={{ color: hasLike ? 'var(--ink)' : 'var(--accent-4)' }} />
                </button>
                <button
                  className={`react-btn${hasDislike ? ' active' : ''}`}
                  title="Dislike"
                  onClick={() => { if (user) handleVote('dislike'); setReactPopOpen(false) }}
                  style={{ background: hasDislike ? 'var(--accent-1)' : 'var(--bg-panel)', borderColor: hasDislike ? 'var(--accent-1)' : 'var(--ink)' }}
                >
                  <ThumbsDown size={18} strokeWidth={2.5} style={{ color: hasDislike ? 'var(--bg-panel)' : 'var(--accent-1)' }} />
                </button>
              </div>
            )}
          </div>

          {/* ② Reacción with emoji popover */}
          <div
            className={`box-action${hasCustom ? ' active-react' : ''}`}
            style={{ position: 'relative' }}
            onMouseEnter={() => { clearTimeout(voteTimer.current); setEmojiPopOpen(true) }}
            onMouseLeave={() => { voteTimer.current = setTimeout(() => setEmojiPopOpen(false), 120) }}
          >
            <span style={{ fontSize: 15 }}>
              {customReaction ? customReaction.emoji : '😀'}
            </span>
            <span>{customReaction ? customReaction.label : 'Reacción'}</span>

            {emojiPopOpen && user && (
              <div
                className="reactions-pop"
                onMouseEnter={() => clearTimeout(voteTimer.current)}
                onMouseLeave={() => { voteTimer.current = setTimeout(() => setEmojiPopOpen(false), 120) }}
              >
                {CUSTOM_REACTIONS.map(r => (
                  <button
                    key={r.type}
                    className={`react-btn${myReaction === r.type ? ' active' : ''}`}
                    title={r.label}
                    onClick={() => handleReact(r.type)}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ③ Comentar */}
          <button className="box-action" onClick={openComments}>
            <MessageCircle size={15} strokeWidth={2.5} />
            <span>Comentar</span>
          </button>

          {/* ④ Compartir — last */}
          <button className="box-action" onClick={openShare}>
            <Share2 size={15} strokeWidth={2.5} />
            <span>Compartir</span>
          </button>
        </div>
      </div>

      {reactionDetailOpen && (
        <ReactionsDetailModal boxId={box.id} onClose={() => setReactionDetailOpen(false)} />
      )}

      {commentsOpen && (
        <CommentsModal boxId={box.id} onClose={() => setCommentsOpen(false)} />
      )}

      {shareOpen && (
        <ShareModal
          boxId={box.id}
          boxContent={box.content}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  )
}
