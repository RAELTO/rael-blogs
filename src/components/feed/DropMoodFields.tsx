import type { MoodPayload } from '../../types/database'
import { MOOD_COLORS } from './DropModalConfig'

interface DropMoodFieldsProps {
  value: MoodPayload['color']
  onChange: (color: MoodPayload['color']) => void
}

export default function DropMoodFields({ value, onChange }: DropMoodFieldsProps) {
  return (
    <div>
      <div className="drop-field-label">Mood color</div>
      <div className="drop-mood-colors">
        {MOOD_COLORS.map(({ id, hex }) => (
          <button
            type="button"
            key={id}
            onClick={() => onChange(id)}
            className="drop-mood-swatch"
            aria-label={`Use mood color ${id}`}
            aria-pressed={value === id}
            style={{
              background: hex,
              boxShadow: value === id ? '5px 5px 0 var(--ink)' : '2px 2px 0 var(--ink)',
              transform: value === id ? 'translate(-2px,-2px)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}
