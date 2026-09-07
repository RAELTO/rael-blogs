import { Plus, X } from 'lucide-react'
import type { DropThreadItem } from './DropModalConfig'
import { newThreadItem } from './DropModalConfig'

interface DropThreadFieldsProps {
  items: DropThreadItem[]
  onChange: (items: DropThreadItem[]) => void
}

export default function DropThreadFields({ items, onChange }: DropThreadFieldsProps) {
  return (
    <div>
      <div className="drop-field-label">Thread</div>
      <div className="drop-options-col">
        {items.map((item, index) => (
          <div key={item.id} className="drop-item-row">
            <span className="drop-thread-num">{index + 1}.</span>
            <textarea
              value={item.text}
              onChange={event => onChange(items.map((value, itemIndex) => (
                itemIndex === index ? { ...value, text: event.target.value } : value
              )))}
              placeholder={`Item ${index + 1}`}
              className="drop-textarea"
              aria-label={`Thread item ${index + 1}`}
              style={{ flex: 1, minHeight: 70 }}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                className="drop-thread-remove-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, newThreadItem()])} className="drop-add-btn">
        <Plus size={13} /> Add point
      </button>
    </div>
  )
}
