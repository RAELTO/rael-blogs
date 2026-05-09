export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          username: string
          bio: string | null
          avatar_url: string | null
          role: string
          is_banned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          username: string
          bio?: string | null
          avatar_url?: string | null
          role?: string
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          username?: string
          bio?: string | null
          avatar_url?: string | null
          role?: string
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      boxes: {
        Row: {
          id: string
          author_id: string
          type: 'quick' | 'media' | 'poll' | 'mood' | 'link' | 'thread'
          content: string
          payload: Json
          status: 'published' | 'draft' | 'archived'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          type?: 'quick' | 'media' | 'poll' | 'mood' | 'link' | 'thread'
          content?: string
          payload?: Json
          status?: 'published' | 'draft' | 'archived'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          type?: 'quick' | 'media' | 'poll' | 'mood' | 'link' | 'thread'
          content?: string
          payload?: Json
          status?: 'published' | 'draft' | 'archived'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'boxes_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      box_tags: {
        Row: {
          box_id: string
          tag_id: string
        }
        Insert: {
          box_id: string
          tag_id: string
        }
        Update: {
          box_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'box_tags_box_id_fkey'
            columns: ['box_id']
            referencedRelation: 'boxes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'box_tags_tag_id_fkey'
            columns: ['tag_id']
            referencedRelation: 'tags'
            referencedColumns: ['id']
          }
        ]
      }
      box_reactions: {
        Row: {
          box_id: string
          user_id: string
          reaction_type: 'bold' | 'loud' | 'fire' | 'sharp' | 'save' | 'angry'
          created_at: string
        }
        Insert: {
          box_id: string
          user_id: string
          reaction_type: 'bold' | 'loud' | 'fire' | 'sharp' | 'save' | 'angry'
          created_at?: string
        }
        Update: {
          box_id?: string
          user_id?: string
          reaction_type?: 'bold' | 'loud' | 'fire' | 'sharp' | 'save' | 'angry'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'box_reactions_box_id_fkey'
            columns: ['box_id']
            referencedRelation: 'boxes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'box_reactions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      box_shares: {
        Row: { id: string; box_id: string; user_id: string; share_type: 'feed' | 'whatsapp' | 'link' | 'contact' | 'group'; created_at: string }
        Insert: { id?: string; box_id: string; user_id: string; share_type: 'feed' | 'whatsapp' | 'link' | 'contact' | 'group'; created_at?: string }
        Update: { id?: string; box_id?: string; user_id?: string; share_type?: 'feed' | 'whatsapp' | 'link' | 'contact' | 'group'; created_at?: string }
        Relationships: []
      }
      comment_votes: {
        Row: { comment_id: string; user_id: string; vote: 'like' | 'dislike'; created_at: string }
        Insert: { comment_id: string; user_id: string; vote: 'like' | 'dislike'; created_at?: string }
        Update: { comment_id?: string; user_id?: string; vote?: 'like' | 'dislike'; created_at?: string }
        Relationships: []
      }
      comment_reactions: {
        Row: { comment_id: string; user_id: string; reaction_type: 'bold' | 'loud' | 'fire' | 'sharp' | 'save' | 'angry'; created_at: string }
        Insert: { comment_id: string; user_id: string; reaction_type: 'bold' | 'loud' | 'fire' | 'sharp' | 'save' | 'angry'; created_at?: string }
        Update: { comment_id?: string; user_id?: string; reaction_type?: 'bold' | 'loud' | 'fire' | 'sharp' | 'save' | 'angry'; created_at?: string }
        Relationships: []
      }
      box_votes: {
        Row: {
          box_id: string
          user_id: string
          vote: 'like' | 'dislike'
          created_at: string
        }
        Insert: {
          box_id: string
          user_id: string
          vote: 'like' | 'dislike'
          created_at?: string
        }
        Update: {
          box_id?: string
          user_id?: string
          vote?: 'like' | 'dislike'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'box_votes_box_id_fkey'
            columns: ['box_id']
            referencedRelation: 'boxes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'box_votes_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      box_saves: {
        Row: {
          box_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          box_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          box_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'box_saves_box_id_fkey'
            columns: ['box_id']
            referencedRelation: 'boxes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'box_saves_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      box_comments: {
        Row: {
          id: string
          box_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          box_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          box_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'box_comments_box_id_fkey'
            columns: ['box_id']
            referencedRelation: 'boxes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'box_comments_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_following_id_fkey'
            columns: ['following_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_banned: {
        Args: Record<string, never>
        Returns: boolean
      }
      search_boxes: {
        Args: { q: string; lim?: number }
        Returns: Database['public']['Tables']['boxes']['Row'][]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type Profile      = Database['public']['Tables']['profiles']['Row']
export type Tag          = Database['public']['Tables']['tags']['Row']
export type Box          = Database['public']['Tables']['boxes']['Row']
export type BoxTag       = Database['public']['Tables']['box_tags']['Row']
export type BoxReaction  = Database['public']['Tables']['box_reactions']['Row']
export type BoxSave      = Database['public']['Tables']['box_saves']['Row']
export type BoxComment   = Database['public']['Tables']['box_comments']['Row']
export type Follow       = Database['public']['Tables']['follows']['Row']

export type ReactionType = BoxReaction['reaction_type']
export type VoteType     = 'like' | 'dislike'
export type BoxType      = Box['type']

// Box payload shapes
export interface MediaPayload  { url: string; kind: 'image' | 'video' | 'gif'; caption?: string }
export interface PollOption    { text: string; votes: number }
export interface PollPayload   { question: string; options: PollOption[] }
export interface MoodPayload   { color: 'm1' | 'm2' | 'm3' | 'm4' | 'm5' }
export interface LinkPayload   { url: string; title?: string; description?: string; host?: string; thumbnail?: string }
export interface ThreadPayload { items: string[] }

// Box with author joined (used in feed queries)
export interface BoxWithAuthor extends Box {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
  tags?: Tag[]
  reaction_count?: number
  comment_count?: number
  my_reaction?: ReactionType | null
}
