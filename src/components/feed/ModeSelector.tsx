import type { FeedMode } from '../../features/boxes/useBoxes'

const MODES: { id: FeedMode; label: string }[] = [
  { id: 'foryou',    label: 'For You'   },
  { id: 'following', label: 'Following' },
  { id: 'fresh',     label: 'Fresh'     },
  { id: 'loud',      label: 'Loud'      },
]

interface ModeSelectorProps {
  value: FeedMode
  onChange: (mode: FeedMode) => void
}

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      {MODES.map(m => (
        <button type="button"
          key={m.id}
          className={`btn btn-small ${value === m.id ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
