import { useRef, useState } from 'react'
import { Zap, Camera, AlignLeft, AlignJustify, Sparkles, Link2, X, Plus } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useCreateBox } from '../../features/boxes/useBoxes'
import { uploadCoverImage } from '../../lib/storage'
import { getVideoEmbedUrl } from '../../lib/videoEmbed'
import { useToast } from '../ui/Toast'
import { sanitizeUrl } from '../../lib/sanitize'
import type { BoxType, MoodPayload } from '../../types/database'

// ─── Type config ───────────────────────────────────────────────────────────────
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

// ─── Props ─────────────────────────────────────────────────────────────────────
interface DropModalProps {
  initialType?: BoxType
  onClose: () => void
}

// ─── Shared style tokens ────────────────────────────────────────────────────────
const BORDER  = '3px solid var(--ink)'
const SHADOW  = '6px 6px 0 var(--ink)'
const FONT_DISPLAY = "'Archivo Black', sans-serif"
const FONT_MONO    = "'Space Mono', monospace"

// ─── Component ─────────────────────────────────────────────────────────────────
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
  const [mediaFile,    setMediaFile]    = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [videoUrl,     setVideoUrl]     = useState('')
  const [linkUrl,      setLinkUrl]      = useState('')
  const [pollOpts,     setPollOpts]     = useState(['', '', ''])
  const [threadItems,  setThreadItems]  = useState(['', ''])
  const [uploading,    setUploading]    = useState(false)

  const embedUrl    = getVideoEmbedUrl(videoUrl)
  const parsedTags  = tagsInput.split(/[\s,]+/).map(t => t.trim()).filter(Boolean)
    .map(t => (t.startsWith('#') ? t.slice(1) : t))

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setMediaFile(f)
    setMediaPreview(URL.createObjectURL(f))
  }

  async function handlePublish() {
    if (!user) return
    let content = text.trim()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: Record<string, any> = {}
    try {
      setUploading(true)
      if (type === 'quick' && !content) { toast('Escribe algo antes de dropear.'); return }
      if (type === 'media') {
        if (mediaMode === 'image') {
          if (!mediaFile) { toast('Sube una imagen primero.'); return }
          const url = await uploadCoverImage(mediaFile, user.id)
          payload = { url, kind: 'image' }
        } else {
          if (!embedUrl) { toast('URL de YouTube o Vimeo no válida.'); return }
          payload = { url: embedUrl, kind: 'video' }
        }
      }
      if (type === 'mood') {
        if (!content) { toast('Escribe el mood.'); return }
        payload = { color: mood }
      }
      if (type === 'poll') {
        const opts = pollOpts.filter(o => o.trim())
        if (opts.length < 2) { toast('Necesitas al menos 2 opciones.'); return }
        payload = { question: content || '¿Cuál eliges?', options: opts.map(o => ({ text: o, votes: 0 })) }
        if (!content) content = '¿Cuál eliges?'
      }
      if (type === 'thread') {
        const items = threadItems.filter(i => i.trim())
        if (!content) { toast('Escribe un título para el hilo.'); return }
        if (items.length < 1) { toast('Agrega al menos un punto.'); return }
        payload = { items }
      }
      if (type === 'link') {
        const safeUrl = sanitizeUrl(linkUrl)
        if (!safeUrl) { toast('URL no válida. Solo se permiten URLs http/https.'); return }
        try { const u = new URL(safeUrl); payload = { url: safeUrl, host: u.hostname } }
        catch { toast('URL no válida.'); return }
        if (!content) content = safeUrl
      }
      await createBox.mutateAsync({ author_id: user.id, type, content, payload, tags: parsedTags })
      toast('¡DROP PUBLICADO! ✦')
      onClose()
    } catch { toast('Error al publicar. Inténtalo de nuevo.') }
    finally { setUploading(false) }
  }

  // ── Layout helpers ──
  const labelStyle: React.CSSProperties = {
    fontFamily: FONT_MONO,
    fontSize: 10,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--ink-mute)',
    marginBottom: 8,
    fontWeight: 800,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    border: BORDER,
    padding: '10px 14px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    background: 'var(--bg-panel)',
    color: 'var(--ink)',
    outline: 'none',
    borderRadius: 0,
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: 120,
    lineHeight: 1.5,
  }

  return (
    /* ── Overlay ── */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* ── Modal panel ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-panel)',
          border: BORDER,
          boxShadow: SHADOW,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: BORDER,
          background: 'var(--accent-2)',
          flexShrink: 0,
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: 24,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
          }}>
            NUEVO DROP
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              border: BORDER,
              background: 'var(--bg-panel)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: 13,
              cursor: 'pointer', color: 'var(--ink)',
              boxShadow: '2px 2px 0 var(--ink)',
            }}
          >
            <X size={13} strokeWidth={2.5} /> Cerrar
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Type grid ── */}
          <div>
            <div style={labelStyle}>Tipo de Box</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
            }}>
              {DROP_TYPES.map(({ id, label, Icon, bg }) => {
                const selected = type === id
                return (
                  <div
                    key={id}
                    onClick={() => setType(id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '18px 10px',
                      border: BORDER,
                      cursor: 'pointer',
                      background: selected ? 'var(--ink)' : bg,
                      color: selected ? 'var(--bg-panel)' : 'var(--ink)',
                      fontFamily: FONT_DISPLAY,
                      fontSize: 11,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      boxShadow: selected ? '4px 4px 0 var(--ink-mute)' : '2px 2px 0 var(--ink)',
                      transition: 'transform .08s',
                      userSelect: 'none',
                    }}
                  >
                    <Icon size={28} strokeWidth={2} />
                    {label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Content textarea (all types) ── */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={
              type === 'mood'   ? '¿Cuál es el mood?' :
              type === 'thread' ? 'Título del hilo…'  :
              type === 'poll'   ? 'Pregunta de la encuesta…' :
              '¿Qué quieres dropear?'
            }
            style={textareaStyle}
          />

          {/* ── Media Box extras ── */}
          {type === 'media' && (
            <div>
              <div style={labelStyle}>Tipo de medio</div>
              <div style={{
                display: 'flex',
                border: BORDER,
                boxShadow: '2px 2px 0 var(--ink)',
                marginBottom: 12,
              }}>
                {(['image', 'video'] as const).map((m, i) => (
                  <button
                    key={m}
                    onClick={() => setMediaMode(m)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: 'none',
                      borderLeft: i > 0 ? BORDER : 'none',
                      background: mediaMode === m ? 'var(--ink)' : 'var(--bg-panel)',
                      color: mediaMode === m ? 'var(--bg-panel)' : 'var(--ink)',
                      fontFamily: FONT_DISPLAY,
                      fontSize: 12,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontWeight: 900,
                    }}
                  >
                    {m === 'image' ? 'Imagen' : 'Video'}
                  </button>
                ))}
              </div>

              {mediaMode === 'image' ? (
                <>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }} onChange={handleFile} />
                  {mediaPreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={mediaPreview} alt="preview"
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', border: BORDER, display: 'block' }} />
                      <button
                        onClick={() => { setMediaFile(null); setMediaPreview(null) }}
                        style={{
                          position: 'absolute', top: 8, right: 8,
                          padding: '4px 8px', border: BORDER, cursor: 'pointer',
                          background: 'var(--accent-1)', fontWeight: 800,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <X size={12} /> Quitar
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{
                        width: '100%', aspectRatio: '16/9',
                        background: 'var(--accent-2)',
                        border: BORDER,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* diagonal stripes */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 14px, var(--ink) 14px 16px)',
                        opacity: 0.1, pointerEvents: 'none',
                      }} />
                      <span style={{
                        position: 'relative', zIndex: 1,
                        border: BORDER, padding: '6px 16px',
                        background: 'var(--bg-panel)',
                        fontFamily: FONT_MONO, fontSize: 12,
                        fontWeight: 800, letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}>
                        Sube tu imagen
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... o youtu.be/..."
                    style={{ ...inputStyle, marginBottom: 10 }}
                  />
                  {embedUrl ? (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                      <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: BORDER }}
                        allowFullScreen title="Video preview" />
                    </div>
                  ) : videoUrl ? (
                    <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontFamily: FONT_MONO }}>
                      URL no reconocida — soportamos YouTube y Vimeo.
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}

          {/* ── Mood colors ── */}
          {type === 'mood' && (
            <div>
              <div style={labelStyle}>Color del mood</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {MOOD_COLORS.map(({ id, hex }) => (
                  <div
                    key={id}
                    onClick={() => setMood(id)}
                    style={{
                      width: 48, height: 48,
                      background: hex,
                      border: BORDER,
                      cursor: 'pointer',
                      boxShadow: mood === id ? '5px 5px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                      transform: mood === id ? 'translate(-2px,-2px)' : 'none',
                      transition: 'transform .1s, box-shadow .1s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Poll options ── */}
          {type === 'poll' && (
            <div>
              <div style={labelStyle}>Opciones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pollOpts.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={opt}
                      onChange={e => setPollOpts(p => p.map((v, j) => j === i ? e.target.value : v))}
                      placeholder={`Opción ${i + 1}`}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    {pollOpts.length > 2 && (
                      <button
                        onClick={() => setPollOpts(p => p.filter((_, j) => j !== i))}
                        style={{
                          border: BORDER, background: 'var(--bg-panel)',
                          cursor: 'pointer', padding: '0 10px',
                          color: 'var(--accent-1)',
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOpts.length < 4 && (
                <button
                  onClick={() => setPollOpts(p => [...p, ''])}
                  style={{
                    marginTop: 8,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px',
                    border: BORDER, background: 'var(--bg-panel)',
                    cursor: 'pointer', fontWeight: 800, fontSize: 13,
                    boxShadow: '2px 2px 0 var(--ink)',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <Plus size={13} /> Añadir opción
                </button>
              )}
            </div>
          )}

          {/* ── Thread items ── */}
          {type === 'thread' && (
            <div>
              <div style={labelStyle}>Hilo</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {threadItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 13,
                      color: 'var(--ink-mute)', paddingTop: 12, flexShrink: 0,
                    }}>
                      {i + 1}.
                    </span>
                    <textarea
                      value={item}
                      onChange={e => setThreadItems(p => p.map((v, j) => j === i ? e.target.value : v))}
                      placeholder={`Punto ${i + 1}`}
                      style={{ ...textareaStyle, flex: 1, minHeight: 70 }}
                    />
                    {threadItems.length > 1 && (
                      <button
                        onClick={() => setThreadItems(p => p.filter((_, j) => j !== i))}
                        style={{
                          border: BORDER, background: 'var(--bg-panel)',
                          cursor: 'pointer', padding: '8px 10px',
                          color: 'var(--accent-1)', marginTop: 2,
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setThreadItems(p => [...p, ''])}
                style={{
                  marginTop: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px',
                  border: BORDER, background: 'var(--bg-panel)',
                  cursor: 'pointer', fontWeight: 800, fontSize: 13,
                  boxShadow: '2px 2px 0 var(--ink)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <Plus size={13} /> Añadir punto
              </button>
            </div>
          )}

          {/* ── Link URL ── */}
          {type === 'link' && (
            <div>
              <input
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          )}

          {/* ── Tags ── */}
          <div>
            <div style={labelStyle}>Tags</div>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="#freshdrops #design"
              style={inputStyle}
            />
            {parsedTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {parsedTags.map(t => (
                  <span key={t} className="chip">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderTop: BORDER,
          background: 'var(--bg-alt)',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: BORDER,
              background: 'var(--bg-panel)',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: 14,
              boxShadow: '3px 3px 0 var(--ink)',
              color: 'var(--ink)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handlePublish}
            disabled={uploading || createBox.isPending}
            style={{
              padding: '10px 24px',
              border: BORDER,
              background: 'var(--accent-1)',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: FONT_DISPLAY,
              fontSize: 14,
              letterSpacing: '0.02em',
              boxShadow: '3px 3px 0 var(--ink)',
              color: 'var(--ink)',
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading || createBox.isPending ? '▒ publicando…' : 'DROPEAR ✦'}
          </button>
        </div>
      </div>
    </div>
  )
}
