import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useReactionDetails } from '../../features/reactions/useReactions'
import { useVoteDetails } from '../../features/votes/useVotes'
import Avatar from '../ui/Avatar'
import AdminBadge from '../ui/AdminBadge'
import type { ReactionType, VoteType } from '../../types/database'

const REACTION_META: Record<ReactionType, { emoji: string; label: string }> = {
  bold:  { emoji: '👍', label: 'Me gusta'   },
  loud:  { emoji: '❤️', label: 'Me encanta' },
  fire:  { emoji: '😆', label: 'Haha'       },
  sharp: { emoji: '😮', label: 'Wow'        },
  save:  { emoji: '😢', label: 'Sad'        },
  angry: { emoji: '😠', label: 'Angry'      },
}

type Tab = 'all' | 'likes' | 'reactions'

interface MergedRow {
  userId: string
  displayName: string
  username: string
  avatarUrl: string | null
  role?: string
  vote?: VoteType
  reaction?: ReactionType
}

interface Props {
  boxId: string
  onClose: () => void
}

export default function ReactionsDetailModal({ boxId, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const { data: reactions = [], isLoading: rLoading } = useReactionDetails(boxId, true)
  const { data: votes = [],     isLoading: vLoading } = useVoteDetails(boxId, true)

  const isLoading = rLoading || vLoading

  const likeCount    = votes.filter(v => v.vote === 'like').length
  const dislikeCount = votes.filter(v => v.vote === 'dislike').length

  // Merge votes + reactions by user_id for "Todos"
  const mergedMap = new Map<string, MergedRow>()

  for (const v of votes) {
    mergedMap.set(v.user_id, {
      userId: v.user_id,
      displayName: v.profiles.display_name,
      username: v.profiles.username,
      avatarUrl: v.profiles.avatar_url,
      role: (v.profiles as { role?: string }).role,
      vote: v.vote,
    })
  }
  for (const r of reactions) {
    const existing = mergedMap.get(r.user_id)
    if (existing) {
      existing.reaction = r.reaction_type
    } else {
      mergedMap.set(r.user_id, {
        userId: r.user_id,
        displayName: r.profiles.display_name,
        username: r.profiles.username,
        avatarUrl: r.profiles.avatar_url,
        role: (r.profiles as { role?: string }).role,
        reaction: r.reaction_type,
      })
    }
  }

  const allRows   = Array.from(mergedMap.values())
  const likeRows  = votes.map(v => ({
    userId: v.user_id, displayName: v.profiles.display_name,
    username: v.profiles.username, avatarUrl: v.profiles.avatar_url,
    role: (v.profiles as { role?: string }).role,
    vote: v.vote, reaction: undefined as ReactionType | undefined,
  }))
  const reactionRows = reactions.map(r => ({
    userId: r.user_id, displayName: r.profiles.display_name,
    username: r.profiles.username, avatarUrl: r.profiles.avatar_url,
    role: (r.profiles as { role?: string }).role,
    vote: undefined as VoteType | undefined, reaction: r.reaction_type,
  }))

  const displayedRows = activeTab === 'all' ? allRows : activeTab === 'likes' ? likeRows : reactionRows

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all',       label: 'Todos',      count: allRows.length    },
    { key: 'likes',     label: 'Likes',      count: votes.length      },
    { key: 'reactions', label: 'Reacciones', count: reactions.length  },
  ]

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-panel)', border: '3px solid var(--ink)',
          boxShadow: '6px 6px 0 var(--ink)', width: '100%', maxWidth: 460,
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px', borderBottom: '3px solid var(--ink)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700 }}>
              ▓ ACTIVIDAD · {allRows.length}
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
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink)' }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '3px solid var(--ink)' }}>
          {tabs.map(t => {
            const isActive = activeTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  flex: 1, padding: '10px 8px', border: 'none',
                  borderRight: t.key !== 'reactions' ? '2px solid var(--ink)' : 'none',
                  background: isActive ? 'var(--ink)' : 'none',
                  color: isActive ? 'var(--bg-panel)' : 'var(--ink)',
                  cursor: 'pointer', fontWeight: 800, fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <span>{t.label}</span>
                <span style={{
                  background: isActive ? 'var(--bg-alt)' : 'var(--bg-alt)',
                  color: 'var(--ink)', padding: '1px 6px', fontSize: 10,
                  fontWeight: 900, border: '1px solid var(--ink)',
                }}>
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* User list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {isLoading && (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>
              ▒ cargando...
            </div>
          )}
          {!isLoading && displayedRows.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>
              Sin actividad aquí aún
            </div>
          )}
          {displayedRows.map((row, i) => (
            <div key={`${row.userId}-${i}`} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 18px', borderBottom: '2px solid var(--ink)',
            }}>
              <Avatar name={row.displayName} src={row.avatarUrl} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>
                  {row.displayName}
                  {row.role === 'admin' && <AdminBadge />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                  @{row.username}
                </div>
              </div>

              {/* Badges: vote + reaction combined if both exist */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {row.vote && (
                  <div style={{
                    width: 30, height: 30, border: '2px solid var(--ink)',
                    background: row.vote === 'like' ? 'var(--accent-4)' : 'var(--accent-1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '2px 2px 0 var(--ink)',
                  }}>
                    {row.vote === 'like'
                      ? <ThumbsUp size={14} strokeWidth={2.5} />
                      : <ThumbsDown size={14} strokeWidth={2.5} />
                    }
                  </div>
                )}
                {row.reaction && (
                  <div style={{
                    width: 30, height: 30, border: '2px solid var(--ink)',
                    background: 'var(--bg-alt)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, boxShadow: '2px 2px 0 var(--ink)',
                  }}>
                    {REACTION_META[row.reaction].emoji}
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
