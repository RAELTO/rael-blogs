import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Share2, Link, MessageCircle, Users, Smartphone, Check } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useCreateBox } from '../../features/boxes/useBoxes'
import { useRecordShare } from '../../features/shares/useShares'
import { useToast } from '../ui/Toast'

interface Props {
  boxId: string
  boxContent: string
  onClose: () => void
}

export default function ShareModal({ boxId, boxContent, onClose }: Props) {
  const { user } = useAuth()
  const toast        = useToast()
  const createBox    = useCreateBox()
  const recordShare  = useRecordShare(boxId)

  const [feedOpen, setFeedOpen]   = useState(false)
  const [feedText, setFeedText]   = useState('')
  const [copied,   setCopied]     = useState(false)
  const [posting,  setPosting]    = useState(false)

  const shareUrl = `${window.location.origin}/box/${boxId}`

  async function handleFeedShare() {
    if (!user) { toast('Inicia sesión para compartir.'); return }
    setPosting(true)
    try {
      await createBox.mutateAsync({
        author_id: user.id,
        type: 'quick',
        content: feedText.trim() || '↗ Compartió un drop',
        payload: { shared_from_id: boxId },
      })
      await recordShare.mutateAsync({ userId: user.id, shareType: 'feed' })
      toast('¡Compartido en tu feed! ✦')
      onClose()
    } catch { toast('Error al compartir.') }
    finally { setPosting(false) }
  }

  async function handleWhatsApp() {
    const text = encodeURIComponent(`${boxContent.slice(0, 100)}...\n\n${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    if (user) await recordShare.mutateAsync({ userId: user.id, shareType: 'whatsapp' }).catch(() => {})
    onClose()
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    if (user) await recordShare.mutateAsync({ userId: user.id, shareType: 'link' }).catch(() => {})
    setTimeout(() => { setCopied(false); onClose() }, 1500)
  }

  function handleProximamente(label: string) {
    toast(`${label}: próximamente`)
    onClose()
  }

  const options = [
    {
      id: 'feed',
      icon: <Share2 size={20} strokeWidth={2} />,
      label: 'Compartir en Feed',
      desc: 'Comparte este drop con un comentario',
      accent: 'var(--accent-2)',
      action: () => setFeedOpen(o => !o),
    },
    {
      id: 'whatsapp',
      icon: <Smartphone size={20} strokeWidth={2} />,
      label: 'WhatsApp',
      desc: 'Envía el enlace por WhatsApp',
      accent: '#25D366',
      action: handleWhatsApp,
    },
    {
      id: 'link',
      icon: copied ? <Check size={20} strokeWidth={2.5} /> : <Link size={20} strokeWidth={2} />,
      label: copied ? '¡Enlace copiado!' : 'Copiar enlace',
      desc: shareUrl,
      accent: copied ? 'var(--accent-4)' : 'var(--accent-3)',
      action: handleCopyLink,
    },
    {
      id: 'contact',
      icon: <MessageCircle size={20} strokeWidth={2} />,
      label: 'Enviar a contacto',
      desc: 'Envía directamente a un amigo',
      accent: 'var(--accent-5)',
      action: () => handleProximamente('Enviar a contacto'),
    },
    {
      id: 'group',
      icon: <Users size={20} strokeWidth={2} />,
      label: 'Compartir a grupo',
      desc: 'Comparte en un grupo al que perteneces',
      accent: 'var(--accent-3)',
      action: () => handleProximamente('Compartir a grupo'),
    },
  ]

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-panel)', border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', width: '100%', maxWidth: 440 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '3px solid var(--ink)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700 }}>
            ▓ COMPARTIR
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink)' }}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Options */}
        {options.map((opt, i) => (
          <div key={opt.id}>
            <button
              onClick={opt.action}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 18px',
                borderBottom: i < options.length - 1 || feedOpen ? '2px solid var(--ink)' : 'none',
                textAlign: 'left',
                transition: 'background .1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {/* Icon badge */}
              <div style={{
                width: 42, height: 42, flexShrink: 0,
                background: opt.accent, border: '2px solid var(--ink)',
                boxShadow: '3px 3px 0 var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink)',
              }}>
                {opt.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{opt.label}</div>
                <div style={{
                  fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginTop: 2,
                }}>
                  {opt.desc}
                </div>
              </div>

              {/* Chevron for feed */}
              {opt.id === 'feed' && (
                <span style={{ fontSize: 18, color: 'var(--ink-mute)', transform: feedOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
                  ›
                </span>
              )}
            </button>

            {/* Feed compose area */}
            {opt.id === 'feed' && feedOpen && (
              <div style={{ padding: '12px 18px 14px', borderBottom: '2px solid var(--ink)', background: 'var(--bg-alt)' }}>
                <textarea
                  value={feedText}
                  onChange={e => setFeedText(e.target.value)}
                  placeholder="Añade un comentario… (opcional)"
                  rows={3}
                  style={{
                    width: '100%', border: '2px solid var(--ink)', padding: '10px 12px',
                    fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5,
                    resize: 'none', outline: 'none', background: 'var(--bg-panel)',
                    boxSizing: 'border-box', color: 'var(--ink)',
                    boxShadow: 'none', transform: 'none',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    onClick={handleFeedShare}
                    disabled={posting}
                    style={{
                      padding: '8px 20px', border: '2px solid var(--ink)',
                      background: 'var(--accent-1)', color: 'var(--bg-panel)',
                      fontWeight: 800, fontSize: 13, cursor: 'pointer',
                      fontFamily: 'var(--font-display)', boxShadow: '3px 3px 0 var(--ink)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {posting ? '...' : 'DROPEAR ✦'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}
