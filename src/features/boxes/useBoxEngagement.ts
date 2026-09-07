import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ReactionType, VoteType } from '../../types/database'

export interface BoxEngagement {
  myReaction: ReactionType | null
  myVote: VoteType | null
  myPollVote: number | null
  isSaved: boolean
  reactionCounts: Record<ReactionType, number>
  voteCounts: Record<VoteType, number>
  pollVoteCounts: Record<number, number>
  shareCount: number
}

export type BoxEngagementById = Record<string, BoxEngagement>

interface QueryPage<T> {
  data: T[] | null
  error: unknown
  count: number | null
}

interface ReactionRow {
  box_id: string
  user_id: string
  reaction_type: ReactionType
}

interface VoteRow {
  box_id: string
  user_id: string
  vote: VoteType
}

interface PollVoteRow {
  box_id: string
  user_id: string
  option_index: number
}

interface ShareRow {
  id: string
  box_id: string
}

interface SaveRow {
  box_id: string
}

const PAGE_SIZE = 1_000

function createEngagement(): BoxEngagement {
  return {
    myReaction: null,
    myVote: null,
    myPollVote: null,
    isSaved: false,
    reactionCounts: { bold: 0, loud: 0, fire: 0, sharp: 0, save: 0, angry: 0 },
    voteCounts: { like: 0, dislike: 0 },
    pollVoteCounts: {},
    shareCount: 0,
  }
}

function createEngagementMap(boxIds: string[]): BoxEngagementById {
  return Object.fromEntries(boxIds.map((boxId) => [boxId, createEngagement()]))
}

async function fetchAllPages<T>(
  loadPage: (from: number, to: number) => PromiseLike<QueryPage<T>>,
): Promise<T[]> {
  const firstPage = await loadPage(0, PAGE_SIZE - 1)
  if (firstPage.error) throw firstPage.error

  const firstRows = firstPage.data ?? []
  if (firstPage.count === null) {
    if (firstRows.length < PAGE_SIZE) return firstRows
    return firstRows.concat(await fetchPagesUntilShort(loadPage, PAGE_SIZE))
  }

  const remainingPageCount = Math.ceil(firstPage.count / PAGE_SIZE) - 1
  if (remainingPageCount <= 0) return firstRows

  const remainingPages = await Promise.all(
    Array.from({ length: remainingPageCount }, (_, index) => {
      const from = (index + 1) * PAGE_SIZE
      return loadPage(from, from + PAGE_SIZE - 1)
    }),
  )

  const error = remainingPages.find((page) => page.error)?.error
  if (error) throw error

  return firstRows.concat(...remainingPages.map((page) => page.data ?? []))
}

async function fetchPagesUntilShort<T>(
  loadPage: (from: number, to: number) => PromiseLike<QueryPage<T>>,
  from: number,
): Promise<T[]> {
  const page = await loadPage(from, from + PAGE_SIZE - 1)
  if (page.error) throw page.error

  const rows = page.data ?? []
  if (rows.length < PAGE_SIZE) return rows

  return rows.concat(
    await fetchPagesUntilShort(loadPage, from + PAGE_SIZE),
  )
}

async function fetchBoxEngagement(boxIds: string[], userId?: string): Promise<BoxEngagementById> {
  const engagement = createEngagementMap(boxIds)

  const savesRequest = userId
    ? fetchAllPages<SaveRow>((from, to) => supabase
        .from('box_saves')
        .select('box_id', { count: 'exact' })
        .eq('user_id', userId)
        .in('box_id', boxIds)
        .order('box_id')
        .range(from, to))
    : Promise.resolve([])

  const [reactions, votes, pollVotes, shares, saves] = await Promise.all([
    fetchAllPages<ReactionRow>((from, to) => supabase
      .from('box_reactions')
      .select('box_id, user_id, reaction_type', { count: 'exact' })
      .in('box_id', boxIds)
      .order('box_id')
      .order('user_id')
      .range(from, to)),
    fetchAllPages<VoteRow>((from, to) => supabase
      .from('box_votes')
      .select('box_id, user_id, vote', { count: 'exact' })
      .in('box_id', boxIds)
      .order('box_id')
      .order('user_id')
      .range(from, to)),
    fetchAllPages<PollVoteRow>((from, to) => supabase
      .from('box_poll_votes')
      .select('box_id, user_id, option_index', { count: 'exact' })
      .in('box_id', boxIds)
      .order('box_id')
      .order('user_id')
      .range(from, to)),
    fetchAllPages<ShareRow>((from, to) => supabase
      .from('box_shares')
      .select('id, box_id', { count: 'exact' })
      .in('box_id', boxIds)
      .order('box_id')
      .order('id')
      .range(from, to)),
    savesRequest,
  ])

  for (const row of reactions) {
    const item = engagement[row.box_id]
    if (!item) continue
    const type = row.reaction_type as ReactionType
    item.reactionCounts[type]++
    if (userId && row.user_id === userId) item.myReaction = type
  }

  for (const row of votes) {
    const item = engagement[row.box_id]
    if (!item) continue
    const vote = row.vote as VoteType
    item.voteCounts[vote]++
    if (userId && row.user_id === userId) item.myVote = vote
  }

  for (const row of pollVotes) {
    const item = engagement[row.box_id]
    if (!item) continue
    item.pollVoteCounts[row.option_index] = (item.pollVoteCounts[row.option_index] ?? 0) + 1
    if (userId && row.user_id === userId) item.myPollVote = row.option_index
  }

  for (const row of shares) {
    const item = engagement[row.box_id]
    if (item) item.shareCount++
  }

  for (const row of saves) {
    const item = engagement[row.box_id]
    if (item) item.isSaved = true
  }

  return engagement
}

export function useBoxEngagement(boxIds: string[], userId?: string) {
  const uniqueBoxIds = [...new Set(boxIds)].toSorted()

  const query = useQuery({
    queryKey: ['box-engagement', userId ?? null, uniqueBoxIds],
    queryFn: () => fetchBoxEngagement(uniqueBoxIds, userId),
    enabled: uniqueBoxIds.length > 0,
    placeholderData: () => createEngagementMap(uniqueBoxIds),
    staleTime: 30_000,
  })

  return {
    ...query,
    data: query.data ?? createEngagementMap(uniqueBoxIds),
  }
}
