import { useReactionDetails } from '../../features/reactions/useReactions'
import { useVoteDetails } from '../../features/votes/useVotes'
import ActivityModal, { type ActivityRow } from './ActivityModal'
import type { ReactionType, VoteType } from '../../types/database'

interface Props {
  boxId: string
  onClose: () => void
}

export default function ReactionsDetailModal({ boxId, onClose }: Props) {
  const { data: reactions = [], isLoading: rLoading } = useReactionDetails(boxId, true)
  const { data: votes = [],     isLoading: vLoading } = useVoteDetails(boxId, true)

  const likeCount    = votes.filter(v => v.vote === 'like').length
  const dislikeCount = votes.filter(v => v.vote === 'dislike').length

  const mergedMap = new Map<string, ActivityRow>()
  for (const v of votes) {
    mergedMap.set(v.user_id, {
      userId: v.user_id,
      displayName: v.profiles.display_name,
      username: v.profiles.username,
      avatarUrl: v.profiles.avatar_url,
      role: (v.profiles as { role?: string }).role,
      vote: v.vote as VoteType,
    })
  }
  for (const r of reactions) {
    const existing = mergedMap.get(r.user_id)
    if (existing) existing.reaction = r.reaction_type as ReactionType
    else mergedMap.set(r.user_id, {
      userId: r.user_id,
      displayName: r.profiles.display_name,
      username: r.profiles.username,
      avatarUrl: r.profiles.avatar_url,
      role: (r.profiles as { role?: string }).role,
      reaction: r.reaction_type as ReactionType,
    })
  }

  const allRows      = Array.from(mergedMap.values())
  const likeRows     = votes.map(v => ({ userId: v.user_id, displayName: v.profiles.display_name, username: v.profiles.username, avatarUrl: v.profiles.avatar_url, role: (v.profiles as { role?: string }).role, vote: v.vote as VoteType }))
  const reactionRows = reactions.map(r => ({ userId: r.user_id, displayName: r.profiles.display_name, username: r.profiles.username, avatarUrl: r.profiles.avatar_url, role: (r.profiles as { role?: string }).role, reaction: r.reaction_type as ReactionType }))

  return (
    <ActivityModal
      allRows={allRows}
      likeRows={likeRows}
      reactionRows={reactionRows}
      likeCount={likeCount}
      dislikeCount={dislikeCount}
      isLoading={rLoading || vLoading}
      onClose={onClose}
    />
  )
}
