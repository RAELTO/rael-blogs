import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/database'

// ─── Types ────────────────────────────────────────────────────────────────────
export type NotifKind =
  | 'reaction' | 'vote' | 'comment' | 'follow'
  | 'contact_request' | 'contact_accepted' | 'share'

export interface NotificationRow {
  id: string
  recipient_id: string
  actor_id: string | null
  kind: NotifKind
  source_table: string
  source_id: string | null
  box_id: string | null
  comment_id: string | null
  contact_request_id: string | null
  metadata: Record<string, unknown>
  dedup_key: string | null
  read_at: string | null
  created_at: string
  updated_at: string
  actor: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
}

const REACTION_EMOJIS: Record<string, string> = {
  loud: '❤️', fire: '😆', sharp: '😮', save: '😢', angry: '😠',
}

export function getNotifText(n: NotificationRow): string {
  switch (n.kind) {
    case 'reaction': {
      const emoji = REACTION_EMOJIS[n.metadata.reaction_type as string] ?? '😀'
      return `reaccionó ${emoji} to your Box`
    }
    case 'vote':
      return n.metadata.vote === 'like' ? 'liked 👍 to your Box' : 'disliked 👎 to your Box'
    case 'comment':
      return 'comentó en tu Box'
    case 'follow':
      return 'empezó a seguirte'
    case 'contact_request':
      return 'wants to add you as a contact'
    case 'contact_accepted':
      return 'aceptó tu solicitud de contacto ✓'
    case 'share':
      return 'compartió tu Box'
    default:
      return ''
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────
// La suscripción Realtime vive en NotifNotifier (App.tsx) — nunca aquí.
export function useNotifications(userId: string | undefined, kind?: NotifKind | NotifKind[]) {
  return useQuery({
    queryKey: ['notifications', userId, kind],
    queryFn: async () => {
      if (!userId) return []
      let q = supabase
        .from('notifications')
        .select('*, actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url)')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (kind) {
        const kinds = Array.isArray(kind) ? kind : [kind]
        q = q.in('kind', kinds)
      }

      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as unknown as NotificationRow[]
    },
    enabled: !!userId,
    staleTime: 20_000,
  })
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['notif-count', userId],
    queryFn: async () => {
      if (!userId) return 0
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .is('read_at', null)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!userId,
    staleTime: 15_000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────
export function useMarkAllRead(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!userId) return
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .is('read_at', null)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-count', userId] })
    },
  })
}

export function useMarkOneRead(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (notifId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notifId)
        .eq('recipient_id', userId ?? '')
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
      qc.invalidateQueries({ queryKey: ['notif-count', userId] })
    },
  })
}
