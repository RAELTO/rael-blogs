import { Plus, X } from 'lucide-react'
import type { DropPollOption } from './DropModalConfig'
import { newPollOption } from './DropModalConfig'

interface DropPollFieldsProps {
  options: DropPollOption[]
  onChange: (options: DropPollOption[]) => void
}

export default function DropPollFields({ options, onChange }: DropPollFieldsProps) {
  return (
    <div>
      <div className="drop-field-label">Options</div>
      <div className="drop-options-col">
        {options.map((option, index) => (
          <div key={option.id} className="drop-item-row" style={{ alignItems: 'center' }}>
            <input
              value={option.text}
              onChange={event => onChange(options.map((item, itemIndex) => (
                itemIndex === index ? { ...item, text: event.target.value } : item
              )))}
              placeholder={`Option ${index + 1}`}
              className="drop-input"
              aria-label={`Poll option ${index + 1}`}
              style={{ flex: 1 }}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => onChange(options.filter((_, itemIndex) => itemIndex !== index))}
                className="drop-remove-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      {options.length < 4 && (
        <button type="button" onClick={() => onChange([...options, newPollOption()])} className="drop-add-btn">
          <Plus size={13} /> Add Option
        </button>
      )}
    </div>
  )
}
