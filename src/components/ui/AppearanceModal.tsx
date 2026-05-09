import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PALETTES, loadTweaks, saveTweaks, type Tweaks } from './tweaks'

interface AppearanceModalProps {
  onClose: () => void
  anchorRef?: React.RefObject<HTMLElement | null>
}

export default function AppearanceModal({ onClose, anchorRef }: AppearanceModalProps) {
  const [tweaks, setTweaks] = useState<Tweaks>(loadTweaks)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const rect = anchorRef?.current?.getBoundingClientRect()
    setPosition({
      top: rect ? rect.bottom + 6 : 0,
      left: rect ? rect.left : 0,
    })
  }, [anchorRef])

  // Apply changes immediately as user interacts
  function set(patch: Partial<Tweaks>) {
    setTweaks(t => {
      const next = { ...t, ...patch }
      saveTweaks(next)
      return next
    })
  }

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        !anchorRef?.current?.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [onClose, anchorRef])

  return createPortal(
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9000,
        width: 280,
        background: 'var(--bg-panel)',
        border: 'var(--border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '16px 16px 14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.01em' }}>
          Apariencia
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink)' }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Paleta */}
      <div className="tweaks-row">
        <label className="field-label">Paleta</label>
        <div className="swatch-row">
          {PALETTES.map(p => (
            <div
              key={p.id}
              className={`swatch${tweaks.palette === p.id ? ' active' : ''}`}
              title={p.label}
              onClick={() => set({ palette: p.id })}
            >
              {p.colors.map((c, i) => <span key={i} style={{ background: c }} />)}
            </div>
          ))}
        </div>
        <div className="text-xs text-mute mt-2" style={{ textAlign: 'center' }}>
          {PALETTES.find(p => p.id === tweaks.palette)?.label}
        </div>
      </div>

      {/* Sombras */}
      <div className="tweaks-row">
        <label className="field-label">Sombras</label>
        <div className="seg">
          {(['low', 'medium', 'high'] as const).map(s => (
            <button
              key={s}
              className={tweaks.shadow === s ? 'active' : ''}
              onClick={() => set({ shadow: s })}
            >
              {s === 'low' ? 'Suave' : s === 'medium' ? 'Normal' : 'Brutal'}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
