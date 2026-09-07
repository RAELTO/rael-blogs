import { useRef } from 'react'
import { X } from 'lucide-react'

interface DropMediaFieldsProps {
  mode: 'image' | 'video'
  preview: string | null
  videoUrl: string
  embedUrl: string | null
  onModeChange: (mode: 'image' | 'video') => void
  onFileChange: (file: File | null, preview: string | null) => void
  onVideoUrlChange: (url: string) => void
}

export default function DropMediaFields({
  mode,
  preview,
  videoUrl,
  embedUrl,
  onModeChange,
  onFileChange,
  onVideoUrlChange,
}: DropMediaFieldsProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onFileChange(file, URL.createObjectURL(file))
  }

  return (
    <div>
      <div className="drop-field-label">Media type</div>
      <div className="drop-media-tabs">
        {(['image', 'video'] as const).map((mediaMode, index) => (
          <button
            type="button"
            key={mediaMode}
            onClick={() => onModeChange(mediaMode)}
            className="drop-media-tab"
            aria-pressed={mode === mediaMode}
            style={{
              borderLeft: index > 0 ? '3px solid var(--ink)' : 'none',
              background: mode === mediaMode ? 'var(--ink)' : 'var(--bg-panel)',
              color: mode === mediaMode ? 'var(--bg-panel)' : 'var(--ink)',
            }}
          >
            {mediaMode === 'image' ? 'Image' : 'Video'}
          </button>
        ))}
      </div>

      {mode === 'image' ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            aria-label="Upload image"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          {preview ? (
            <div className="drop-preview-wrap">
              <img src={preview} alt="Selected preview" width="720" height="480" className="drop-preview-img" />
              <button type="button" onClick={() => onFileChange(null, null)} className="drop-preview-remove">
                <X size={12} /> Remove
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="drop-dropzone">
              <div className="drop-dropzone-stripes" />
              <span className="drop-dropzone-label">Upload your image</span>
            </button>
          )}
        </>
      ) : (
        <>
          <input
            value={videoUrl}
            onChange={event => onVideoUrlChange(event.target.value)}
            placeholder="https://youtube.com/watch?v=… or youtu.be/…"
            className="drop-input"
            aria-label="Video URL"
            style={{ marginBottom: 10 }}
          />
          {embedUrl ? (
            <div className="drop-video-preview">
              <iframe
                src={embedUrl}
                allowFullScreen
                title="Video preview"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>
          ) : videoUrl ? (
            <div className="drop-video-error">URL not recognized - YouTube and Vimeo are supported.</div>
          ) : null}
        </>
      )}
    </div>
  )
}
