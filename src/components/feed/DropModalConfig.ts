import type { ElementType } from 'react'
import { AlignJustify, AlignLeft, Camera, Link2, Sparkles, Zap } from 'lucide-react'
import type { BoxType, MoodPayload } from '../../types/database'

export interface DropTypeOption {
  id: BoxType
  label: string
  Icon: ElementType
  bg: string
}

export interface DropPollOption {
  id: string
  text: string
}

export interface DropThreadItem {
  id: string
  text: string
}

export const DROP_TYPES: DropTypeOption[] = [
  { id: 'quick', label: 'Quick Drop', Icon: Zap, bg: 'var(--accent-1)' },
  { id: 'media', label: 'Media Box', Icon: Camera, bg: 'var(--accent-3)' },
  { id: 'poll', label: 'Poll Box', Icon: AlignLeft, bg: 'var(--accent-2)' },
  { id: 'thread', label: 'Thread Box', Icon: AlignJustify, bg: 'var(--accent-4)' },
  { id: 'mood', label: 'Mood Box', Icon: Sparkles, bg: 'var(--accent-5)' },
  { id: 'link', label: 'Link Box', Icon: Link2, bg: 'var(--bg-alt)' },
]

export const MOOD_COLORS: { id: MoodPayload['color']; hex: string }[] = [
  { id: 'm1', hex: '#ff5a5f' },
  { id: 'm2', hex: '#4cc9f0' },
  { id: 'm3', hex: '#c77dff' },
  { id: 'm4', hex: '#6ee7b7' },
  { id: 'm5', hex: '#ffd23f' },
]

export const newPollOption = (text = ''): DropPollOption => ({ id: crypto.randomUUID(), text })
export const newThreadItem = (text = ''): DropThreadItem => ({ id: crypto.randomUUID(), text })
