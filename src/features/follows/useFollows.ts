import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export interface FollowCounts {
  followers: number
  following: number
}

interface ToggleFollowInput {
  profileId: string
  isFollowing: boolean
}

const followingKey = (userId: string | undefined) => ['follows', 'following', userId] as const
const countsKey = (profileId: string | undefined) => ['follows', 'counts', profileId] as const

export function useFollowingIds(userId: string | undefined) {
  return useQuery({
    queryKey: followingKey(userId),
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)

      if (error) throw error
      return (data ?? []).map(row => row.following_id)
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}

export function useFollowCounts(profileId: string | undefined) {
  return useQuery({
    queryKey: countsKey(profileId),
    queryFn: async (): Promise<FollowCounts> => {
      if (!profileId) return { followers: 0, following: 0 }

      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('following_id', { count: 'exact', head: true })
          .eq('following_id', profileId),
        supabase
          .from('follows')
          .select('follower_id', { count: 'exact', head: true })
          .eq('follower_id', profileId),
      ])

      if (followersResult.error) throw followersResult.error
      if (followingResult.error) throw followingResult.error

      return {
        followers: followersResult.count ?? 0,
        following: followingResult.count ?? 0,
      }
    },
    enabled: !!profileId,
    staleTime: 30_000,
  })
}

export function useToggleFollow(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ profileId, isFollowing }: ToggleFollowInput) => {
      if (!userId) throw new Error('You must be signed in to follow people.')
      if (userId === profileId) throw new Error('You cannot follow yourself.')

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', profileId)
        if (error) throw error
        return false
      }

      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: userId, following_id: profileId })
      if (error) throw error
      return true
    },
    onMutate: async ({ profileId, isFollowing }) => {
      if (!userId) return undefined

      await Promise.all([
        queryClient.cancelQueries({ queryKey: followingKey(userId) }),
        queryClient.cancelQueries({ queryKey: countsKey(profileId) }),
        queryClient.cancelQueries({ queryKey: countsKey(userId) }),
      ])

      const previousFollowing = queryClient.getQueryData<string[]>(followingKey(userId))
      const previousTargetCounts = queryClient.getQueryData<FollowCounts>(countsKey(profileId))
      const previousViewerCounts = queryClient.getQueryData<FollowCounts>(countsKey(userId))
      const delta = isFollowing ? -1 : 1

      queryClient.setQueryData<string[]>(followingKey(userId), current => {
        const ids = current ?? []
        return isFollowing
          ? ids.filter(id => id !== profileId)
          : Array.from(new Set([...ids, profileId]))
      })
      queryClient.setQueryData<FollowCounts>(countsKey(profileId), current => current
        ? { ...current, followers: Math.max(0, current.followers + delta) }
        : current)
      queryClient.setQueryData<FollowCounts>(countsKey(userId), current => current
        ? { ...current, following: Math.max(0, current.following + delta) }
        : current)

      return { previousFollowing, previousTargetCounts, previousViewerCounts, profileId }
    },
    onError: (_error, _input, context) => {
      if (!userId || !context) return
      queryClient.setQueryData(followingKey(userId), context.previousFollowing)
      queryClient.setQueryData(countsKey(context.profileId), context.previousTargetCounts)
      queryClient.setQueryData(countsKey(userId), context.previousViewerCounts)
    },
    onSettled: (_data, _error, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: followingKey(userId) })
      queryClient.invalidateQueries({ queryKey: countsKey(profileId) })
      queryClient.invalidateQueries({ queryKey: countsKey(userId) })
      queryClient.invalidateQueries({ queryKey: ['boxes', 'feed', 'following'] })
      queryClient.invalidateQueries({ queryKey: ['suggested-contacts', userId] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
