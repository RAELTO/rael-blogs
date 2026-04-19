import { getInitials } from '../../lib/utils'

const ACCENT_COLORS = ['var(--accent-1)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)', 'var(--accent-2)']

function colorFor(name: string) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return ACCENT_COLORS[hash % ACCENT_COLORS.length]
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  src?: string | null
  onClick?: () => void
}

export default function Avatar({ name, size = 'md', src, onClick }: AvatarProps) {
  return (
    <div
      className={`avatar ${size}`}
      onClick={onClick}
      style={{ background: src ? undefined : colorFor(name) }}
    >
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : getInitials(name)
      }
    </div>
  )
}
