import { useRef, useState } from 'react'
import { validateImage, type ImageKind, IMAGE_LIMITS } from '../../lib/storage'

interface ImageUploadProps {
  kind: ImageKind
  currentUrl?: string | null
  onFile: (file: File) => void
  uploading?: boolean
}

export default function ImageUpload({ kind, currentUrl, onFile, uploading }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateImage(file, kind)
    if (validationError) {
      setError(validationError.message)
      e.target.value = ''
      return
    }

    setError(null)
    setPreview(URL.createObjectURL(file))
    onFile(file)
  }

  const displayUrl = preview ?? currentUrl
  const limit = IMAGE_LIMITS[kind]
  const isAvatar = kind === 'avatar'

  return (
    <div>
      {displayUrl && (
        <div style={{
          marginBottom: 12,
          border: 'var(--border)',
          overflow: 'hidden',
          width: isAvatar ? 100 : '100%',
          height: isAvatar ? 100 : 180,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <img
            src={displayUrl}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      <button
        type="button"
        className="btn btn-small"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {uploading ? '▒ subiendo...' : displayUrl ? '↺ Cambiar imagen' : '↑ Subir imagen'}
      </button>

      <div className="text-xs text-mute mt-3">
        JPG, PNG, WebP o GIF · máx. {limit.label}
      </div>

      {error && (
        <div style={{ color: 'var(--accent-1)', fontSize: 12, marginTop: 6, fontWeight: 700 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  )
}
