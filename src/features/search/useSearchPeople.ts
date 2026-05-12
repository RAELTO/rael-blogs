import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/database'

type ProfilePreview = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>

export type SearchPersonStatus = 'contact' | 'pending_sent' | 'pending_received' | 'none'

export interface SearchPersonResult {
  profile: ProfilePreview
  status: SearchPersonStatus
  requestId: string | null
}

interface ContactRequestPreview {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined' | 'canceled'
}

interface ContactPreview {
  user_a: string
  user_b: string
}

function normalizeSearchTerm(q: string) {
  return q
    .trim()
    .replace(/[%_*,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 80)
}

function textRank(profile: ProfilePreview, term: string) {
  const q = term.toLowerCase()
  const display = profile.display_name.toLowerCase()
  const username = profile.username.toLowerCase()

  if (display === q || username === q) return 0
  if (display.startsWith(q)) return 1
  if (username.startsWith(q)) return 2
  if (display.includes(q)) return 3
  if (username.includes(q)) return 4
  return 5
}

function statusRank(status: SearchPersonStatus) {
  if (status === 'contact') return 0
  if (status === 'pending_received') return 1
  if (status === 'none') return 2
  return 3
}

async function fetchSearchPeople(rawQ: string, userId: string): Promise<SearchPersonResult[]> {
  const q = normalizeSearchTerm(rawQ)
  if (q.length < 2) return []

  const pattern = `%${q}%`

  const [displayRes, usernameRes, requestRes, contactRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .ilike('display_name', pattern)
      .neq('id', userId)
      .eq('is_banned', false)
      .limit(16),
    supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .ilike('username', pattern)
      .neq('id', userId)
      .eq('is_banned', false)
      .limit(16),
    supabase
      .from('contact_requests')
      .select('id, requester_id, addressee_id, status')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .in('status', ['pending', 'accepted']),
    supabase
      .from('contacts')
      .select('user_a, user_b')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`),
  ])

  if (displayRes.error) throw displayRes.error
  if (usernameRes.error) throw usernameRes.error
  if (requestRes.error) throw requestRes.error
  if (contactRes.error) throw contactRes.error

  const profilesById = new Map<string, ProfilePreview>()
  for (const profile of [...(displayRes.data ?? []), ...(usernameRes.data ?? [])]) {
    profilesById.set(profile.id, profile)
  }

  const contacts = new Set<string>()
  for (const contact of (contactRes.data ?? []) as ContactPreview[]) {
    contacts.add(contact.user_a === userId ? contact.user_b : contact.user_a)
  }

  const requestsByOther = new Map<string, ContactRequestPreview>()
  for (const request of (requestRes.data ?? []) as ContactRequestPreview[]) {
    const otherId = request.requester_id === userId ? request.addressee_id : request.requester_id
    requestsByOther.set(otherId, request)
  }

  return [...profilesById.values()]
    .map((profile) => {
      const request = requestsByOther.get(profile.id)
      const status: SearchPersonStatus = contacts.has(profile.id)
        ? 'contact'
        : request?.status === 'pending'
          ? request.requester_id === userId ? 'pending_sent' : 'pending_received'
          : 'none'

      return {
        profile,
        status,
        requestId: request?.id ?? null,
      }
    })
    .sort((a, b) => {
      const byStatus = statusRank(a.status) - statusRank(b.status)
      if (byStatus !== 0) return byStatus
      const byText = textRank(a.profile, q) - textRank(b.profile, q)
      if (byText !== 0) return byText
      return a.profile.display_name.localeCompare(b.profile.display_name)
    })
    .slice(0, 8)
}

export function useSearchPeople(q: string, userId: string | undefined) {
  const search = q.trim()

  return useQuery({
    queryKey: ['search-people', userId, search],
    queryFn: () => fetchSearchPeople(search, userId!),
    enabled: !!userId && search.length >= 2,
    staleTime: 30_000,
  })
}
