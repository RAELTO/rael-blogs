import { useRef, useState } from 'react'
import { Zap, Camera, AlignLeft, AlignJustify, Sparkles, Link2, X, Plus } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useCreateBox } from '../../features/boxes/useBoxes'
import { uploadCoverImage } from '../../lib/storage'
import { getVideoEmbedUrl } from '../../lib/videoEmbed'
import { useToast } from '../ui/Toast'
import { sanitizeUrl } from '../../lib/sanitize'
import type { BoxType, MoodPayload } from '../../types/database'

// â”€â”€â”€ Type config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface DropType { id: BoxType; label: string; Icon: React.ElementType; bg: string }

const DROP_TYPES: DropType[] = [
  { id: 'quick',  label: 'Quick Drop',  Icon: Zap,          bg: 'var(--accent-1)' },
  { id: 'media',  label: 'Media Box',   Icon: Camera,       bg: 'var(--accent-3)' },
  { id: 'poll',   label: 'Poll Box',    Icon: AlignLeft,    bg: 'var(--accent-2)' },
  { id: 'thread', label: 'Thread Box',  Icon: AlignJustify, bg: 'var(--accent-4)' },
  { id: 'mood',   label: 'Mood Box',    Icon: Sparkles,     bg: 'var(--accent-5)' },
  { id: 'link',   label: 'Link Box',    Icon: Link2,        bg: 'var(--bg-alt)'   },
]

const MOOD_COLORS: { id: MoodPayload['color']; hex: string }[] = [
  { id: 'm1', hex: '#ff5a5f' },
  { id: 'm2', hex: '#4cc9f0' },
  { id: 'm3', hex: '#c77dff' },
  { id: 'm4', hex: '#6ee7b7' },
  { id: 'm5', hex: '#ffd23f' },
]

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface DropModalProps {
  initialType?: BoxType
  onClose: () => void
}


// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type PollOpt    = { id: string; text: string }
type ThreadItem = { id: string; text: string }
const newOpt  = (text = ''): PollOpt    => ({ id: crypto.randomUUID(), text })
const newItem = (text = ''): ThreadItem => ({ id: crypto.randomUUID(), text })

export default function DropModal({ initialType = 'quick', onClose }: DropModalProps) {
  const { user } = useAuth()
  const createBox  = useCreateBox()
  const toast      = useToast()
  const fileRef    = useRef<HTMLInputElement>(null)

  const [type,         setType]         = useState<BoxType>(initialType)
  const [text,         setText]         = useState('')
  const [tagsInput,    setTagsInput]    = useState('')
  const [mood,         setMood]         = useState<MoodPayload['color']>('m1')
  const [mediaMode,    setMediaMode]    = useState<'image' | 'video'>('image')
  const mediaFileRef                     = useRef<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [videoUrl,     setVideoUrl]     = useState('')
  const [linkUrl,      setLinkUrl]      = useState('')
  const [pollOpts,     setPollOpts]     = useState<PollOpt[]>(() => ['', '', ''].map(newOpt))
  const [threadItems,  setThreadItems]  = useState<ThreadItem[]>(() => ['', ''].map(newItem))
  const [uploading,    setUploading]    = useState(false)

  const embedUrl    = getVideoEmbedUrl(videoUrl)
  const parsedTags  = tagsInput.split(/[\s,]+/).flatMap(t => {
    const s = t.trim()
    return s ? [s.startsWith('#') ? s.slice(1) : s] : []
  })

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    mediaFileRef.current = f
    setMediaPreview(URL.createObjectURL(f))
  }

  async function handlePublish() {
    if (!user) return
    let content = text.trim()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: Record<string, any> = {}
    try {
      setUploading(true)
      if (type === 'quick' && !content) { toast('Write something before dropping.'); return }
      if (type === 'media') {
        if (mediaMode === 'image') {
          if (!mediaFileRef.current) { toast('Upload an image first.'); return }
          const url = await uploadCoverImage(mediaFileRef.current, user.id)
          payload = { url, kind: 'image' }
        } else {
          if (!embedUrl) { toast('Invalid YouTube or Vimeo URL.'); return }
          payload = { url: embedUrl, kind: 'video' }
        }
      }
      if (type === 'mood') {
        if (!content) { toast('Write the mood.'); return }
        payload = { color: mood }
      }
      if (type === 'poll') {
        const opts = pollOpts.flatMap(o => o.text.trim() ? [o.text] : [])
        if (opts.length < 2) { toast('You need at least 2 options.'); return }
        payload = { question: content || 'Which one do you choose?', options: opts.map(o => ({ text: o, votes: 0 })) }
        if (!content) content = 'Which one do you choose?'
      }
      if (type === 'thread') {
        const items = threadItems.flatMap(i => i.text.trim() ? [i.text] : [])
        if (!content) { toast('Write a thread title.'); return }
        if (items.length < 1) { toast('Add at least one item.'); return }
        payload = { items }
      }
      if (type === 'link') {
        const safeUrl = sanitizeUrl(linkUrl)
        if (!safeUrl) { toast('Invalid URL. Only http/https URLs are allowed.'); return }
        try { const u = new URL(safeUrl); payload = { url: safeUrl, host: u.hostname } }
        catch { toast('Invalid URL.'); return }
        if (!content) content = safeUrl
      }
      await createBox.mutateAsync({ author_id: user.id, type, content, payload, tags: parsedTags })
      toast('Drop published.')
      onClose()
    } catch { toast('Failed to publish. Please try again.') }
    finally { setUploading(false) }
  }

  return (
    /* â”€â”€ Overlay â”€â”€ */
    <div
      onClick={onClose}
      className="drop-overlay"
      style={{ zIndex: 'var(--z-drop-modal)' as unknown as number }}
    >
      {/* â”€â”€ Modal panel â”€â”€ */}
      <div onClick={e => e.stopPropagation()} className="drop-panel">

        {/* â”€â”€ Header â”€â”€ */}
        <div className="drop-header">
          <h2 className="drop-title">NEW DROP</h2>
          <button type="button" onClick={onClose} className="drop-close-btn">
            <X size={13} strokeWidth={2.5} /> Close
          </button>
        </div>

        {/* â”€â”€ Body â”€â”€ */}
        <div className="drop-body">

          {/* â”€â”€ Type grid â”€â”€ */}
          <div>
            <div className="drop-field-label">Box type</div>
            <div className="drop-type-grid">
              {DROP_TYPES.map(({ id, label, Icon, bg }) => {
                const selected = type === id
                return (
                  <div
                    key={id}
                    onClick={() => setType(id)}
                    className="drop-type-card"
                    style={{
                      background: selected ? 'var(--ink)' : bg,
                      color: selected ? 'var(--bg-panel)' : 'var(--ink)',
                      boxShadow: selected ? '4px 4px 0 var(--ink-mute)' : '2px 2px 0 var(--ink)',
                    }}
                  >
                    <Icon size={28} strokeWidth={2} />
                    {label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* â”€â”€ Content textarea (all types) â”€â”€ */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={
              type === 'mood'   ? 'What is the mood?' :
              type === 'thread' ? 'Thread title...'  :
              type === 'poll'   ? 'Poll question...' :
              'What do you want to drop?'
            }
            className="drop-textarea"
          />

          {/* â”€â”€ Media Box extras â”€â”€ */}
          {type === 'media' && (
            <div>
              <div className="drop-field-label">Media type</div>
              <div className="drop-media-tabs">
                {(['image', 'video'] as const).map((m, i) => (
                  <button type="button"
                    key={m}
                    onClick={() => setMediaMode(m)}
                    className="drop-media-tab"
                    style={{
                      borderLeft: i > 0 ? '3px solid var(--ink)' : 'none',
                      background: mediaMode === m ? 'var(--ink)' : 'var(--bg-panel)',
                      color: mediaMode === m ? 'var(--bg-panel)' : 'var(--ink)',
                    }}
                  >
                    {m === 'image' ? 'Image' : 'Video'}
                  </button>
                ))}
              </div>

              {mediaMode === 'image' ? (
                <>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }} onChange={handleFile} />
                  {mediaPreview ? (
                    <div className="drop-preview-wrap">
                      <img src={mediaPreview} alt="preview" className="drop-preview-img" />
                      <button type="button"
                        onClick={() => { mediaFileRef.current = null; setMediaPreview(null) }}
                        className="drop-preview-remove"
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} className="drop-dropzone">
                      <div className="drop-dropzone-stripes" />
                      <span className="drop-dropzone-label">Upload your image</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or youtu.be/..."
                    className="drop-input"
                    style={{ marginBottom: 10 }}
                  />
                  {embedUrl ? (
                    <div className="drop-video-preview">
                      <iframe src={embedUrl} allowFullScreen title="Video preview" sandbox="allow-scripts allow-same-origin allow-presentation" />
                    </div>
                  ) : videoUrl ? (
                    <div className="drop-video-error">
                      URL not recognized - YouTube and Vimeo are supported.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}

          {/* â”€â”€ Mood colors â”€â”€ */}
          {type === 'mood' && (
            <div>
              <div className="drop-field-label">Mood color</div>
              <div className="drop-mood-colors">
                {MOOD_COLORS.map(({ id, hex }) => (
                  <div
                    key={id}
                    onClick={() => setMood(id)}
                    className="drop-mood-swatch"
                    style={{
                      background: hex,
                      boxShadow: mood === id ? '5px 5px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                      transform: mood === id ? 'translate(-2px,-2px)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* â”€â”€ Poll options â”€â”€ */}
          {type === 'poll' && (
            <div>
              <div className="drop-field-label">Options</div>
              <div className="drop-options-col">
                {pollOpts.map((opt, i) => (
                  <div key={opt.id} className="drop-item-row" style={{ alignItems: 'center' }}>
                    <input
                      value={opt.text}
                      onChange={e => setPollOpts(p => p.map((v, j) => j === i ? { ...v, text: e.target.value } : v))}
                      placeholder={`Option ${i + 1}`}
                      className="drop-input"
                      style={{ flex: 1 }}
                    />
                    {pollOpts.length > 2 && (
                      <button type="button" onClick={() => setPollOpts(p => p.filter((_, j) => j !== i))} className="drop-remove-btn">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOpts.length < 4 && (
                <button type="button" onClick={() => setPollOpts(p => [...p, newOpt()])} className="drop-add-btn">
                  <Plus size={13} /> Add Option
                </button>
              )}
            </div>
          )}

          {/* â”€â”€ Thread items â”€â”€ */}
          {type === 'thread' && (
            <div>
              <div className="drop-field-label">Thread</div>
              <div className="drop-options-col">
                {threadItems.map((item, i) => (
                  <div key={item.id} className="drop-item-row">
                    <span className="drop-thread-num">{i + 1}.</span>
                    <textarea
                      value={item.text}
                      onChange={e => setThreadItems(p => p.map((v, j) => j === i ? { ...v, text: e.target.value } : v))}
                      placeholder={`Item ${i + 1}`}
                      className="drop-textarea"
                      style={{ flex: 1, minHeight: 70 }}
                    />
                    {threadItems.length > 1 && (
                      <button type="button" onClick={() => setThreadItems(p => p.filter((_, j) => j !== i))} className="drop-thread-remove-btn">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setThreadItems(p => [...p, newItem()])} className="drop-add-btn">
                <Plus size={13} /> Add point
              </button>
            </div>
          )}

          {/* â”€â”€ Link URL â”€â”€ */}
          {type === 'link' && (
            <div>
              <input
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="drop-input"
              />
            </div>
          )}

          {/* â”€â”€ Tags â”€â”€ */}
          <div>
            <div className="drop-field-label">Tags</div>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="#freshdrops #design"
              className="drop-input"
            />
            {parsedTags.length > 0 && (
              <div className="drop-tags-preview">
                {parsedTags.map(t => (
                  <span key={t} className="chip">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* â”€â”€ Footer â”€â”€ */}
        <div className="drop-footer">
          <button type="button" onClick={onClose} className="drop-cancel-btn">Cancel</button>
          <button type="button"
            onClick={handlePublish}
            disabled={uploading || createBox.isPending}
            className="drop-submit-btn"
            style={{
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading || createBox.isPending ? 'dropping...' : 'DROP'}
          </button>
        </div>
      </div>
    </div>
  )
}
