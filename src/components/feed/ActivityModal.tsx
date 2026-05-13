import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, ThumbsUp, ThumbsDown } from 'lucide-react'
import Avatar from '../ui/Avatar'
import AdminBadge from '../ui/AdminBadge'
import type { ReactionType, VoteType } from '../../types/database'

const REACTION_EMOJI: Record<string, string> = {
  bold: '👍', loud: '❤️', fire: '😆', sharp: '😮', save: '😢', angry: '😠',
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
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10200, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-panel)', border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', width: '100%', maxWidth: 460, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '3px solid var(--ink)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700 }}>
              ▓ ACTIVITY · {allRows.length}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--accent-4)', fontFamily: 'var(--font-mono)' }}>
                <ThumbsUp size={12} strokeWidth={2.5} /> {likeCount}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--accent-1)', fontFamily: 'var(--font-mono)' }}>
                <ThumbsDown size={12} strokeWidth={2.5} /> {dislikeCount}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink)' }}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '3px solid var(--ink)' }}>
          {tabs.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '10px 8px', border: 'none',
                borderRight: i < 2 ? '2px solid var(--ink)' : 'none',
                background: tab === t.key ? 'var(--ink)' : 'none',
                color: tab === t.key ? 'var(--bg-panel)' : 'var(--ink)',
                cursor: 'pointer', fontWeight: 800, fontSize: 12,
                fontFamily: 'var(--font-mono)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {t.label}
              <span style={{ background: 'var(--bg-alt)', color: 'var(--ink)', padding: '1px 6px', fontSize: 10, fontWeight: 900, border: '1px solid var(--ink)' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* User list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {isLoading && (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>▒ loading...</div>
          )}
          {!isLoading && rows.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>No activity yet</div>
          )}
          {rows.map((row, i) => (
            <div key={`${row.userId}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '2px solid var(--ink)' }}>
              <Link
                to={`/profile/${row.username}`}
                onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
              >
                <Avatar name={row.displayName} src={row.avatarUrl} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>
                    {row.displayName}
                    {row.role === 'admin' && <AdminBadge />}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>@{row.username}</div>
                </div>
              </Link>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {row.vote && (
                  <div style={{ width: 30, height: 30, border: '2px solid var(--ink)', background: row.vote === 'like' ? 'var(--accent-4)' : 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 var(--ink)' }}>
                    {row.vote === 'like' ? <ThumbsUp size={14} strokeWidth={2.5} /> : <ThumbsDown size={14} strokeWidth={2.5} />}
                  </div>
                )}
                {row.reaction && (
                  <div style={{ width: 30, height: 30, border: '2px solid var(--ink)', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '2px 2px 0 var(--ink)' }}>
                    {REACTION_EMOJI[row.reaction]}
                  </div>
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
