interface DropTagsFieldProps {
  value: string
  tags: string[]
  onChange: (value: string) => void
}

export default function DropTagsField({ value, tags, onChange }: DropTagsFieldProps) {
  return (
    <div>
      <div className="drop-field-label">Tags</div>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="#freshdrops #design"
        className="drop-input"
        aria-label="Tags"
      />
      {tags.length > 0 && (
        <div className="drop-tags-preview">
          {tags.map(tag => <span key={tag} className="chip">#{tag}</span>)}
        </div>
      )}
    </div>
  )
}
