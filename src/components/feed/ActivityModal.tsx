import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, ThumbsUp, ThumbsDown } from 'lucide-react'
import Avatar from '../ui/Avatar'
import AdminBadge from '../ui/AdminBadge'
import type { ReactionType, VoteType } from '../../types/database'

const REACTION_EMOJI: Record<string, string> = {
  bold: 'ðŸ‘', loud: 'â¤ï¸', fire: 'ðŸ˜†', sharp: 'ðŸ˜®', save: 'ðŸ˜¢', angry: 'ðŸ˜ ',
}

export interface ActivityRow {
  userId: string
  displayName: string
  username: string
  avatarUrl: string | null
  role?: string | null
  vote?: VoteType
  reaction?: ReactionType
}

interface Props {
  allRows: ActivityRow[]
  likeRows: ActivityRow[]
  reactionRows: ActivityRow[]
  likeCount: number
  dislikeCount: number
  isLoading: boolean
  onClose: () => void
}

export default function ActivityModal({
  allRows, likeRows, reactionRows,
  likeCount, dislikeCount, isLoading, onClose,
}: Props) {
  const [tab, setTab] = useState<'all' | 'likes' | 'reactions'>('all')

  const tabs = [
    { key: 'all'       as const, label: 'All',       count: allRows.length       },
    { key: 'likes'     as const, label: 'Likes',     count: likeRows.length      },
    { key: 'reactions' as const, label: 'Reactions', count: reactionRows.length  },
  ]
  const rows = tab === 'all' ? allRows : tab === 'likes' ? likeRows : reactionRows

  return createPortal(
    <div className="activity-overlay" onClick={onClose}>
      <div className="activity-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="activity-header">
          <div>
            <div className="activity-title">â–“ ACTIVITY Â· {allRows.length}</div>
            <div className="activity-stats">
              <span className="activity-stat like">
                <ThumbsUp size={12} strokeWidth={2.5} /> {likeCount}
              </span>
              <span className="activity-stat dislike">
                <ThumbsDown size={12} strokeWidth={2.5} /> {dislikeCount}
              </span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className="activity-tabs">
          {tabs.map(t => (
            <button type="button"
              key={t.key}
              className={`activity-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="activity-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* User list */}
        <div className="activity-list">
          {isLoading && <div className="activity-empty">â–’ loading...</div>}
          {!isLoading && rows.length === 0 && (
            <div className="activity-empty">No activity yet</div>
          )}
          {rows.map((row) => (
            <div key={row.userId} className="activity-row">
              <Link className="activity-user-link" to={`/profile/${row.username}`} onClick={onClose}>
                <Avatar name={row.displayName} src={row.avatarUrl} size="sm" />
                <div className="activity-user-info">
                  <div className="activity-user-name">
                    {row.displayName}
                    {row.role === 'admin' && <AdminBadge />}
                  </div>
                  <div className="activity-username">@{row.username}</div>
                </div>
              </Link>
              <div className="activity-badges">
                {row.vote && (
                  <div
                    className="activity-badge"
                    style={{ background: row.vote === 'like' ? 'var(--accent-4)' : 'var(--accent-1)' }}
                  >
                    {row.vote === 'like' ? <ThumbsUp size={14} strokeWidth={2.5} /> : <ThumbsDown size={14} strokeWidth={2.5} />}
                  </div>
                )}
                {row.reaction && (
                  <div className="activity-badge reaction">{REACTION_EMOJI[row.reaction]}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
