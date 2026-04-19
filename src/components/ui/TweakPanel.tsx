import { useEffect, useState } from 'react'

type Palette = 'magenta' | 'miami' | 'toxic' | 'sunset' | 'dark'
type Effects = 'low' | 'medium' | 'high'

interface Tweaks {
  palette: Palette
  effectsIntensity: Effects
}

// Colores de swatch exactos del prototipo (solo preview visual)
const PALETTES: { id: Palette; label: string; colors: string[] }[] = [
  { id: 'magenta', label: 'Magenta', colors: ['#ff2e9a', '#a855f7', '#06b6d4'] },
  { id: 'miami',   label: 'Miami',   colors: ['#ff6bdc', '#00e5ff', '#ffde59'] },
  { id: 'toxic',   label: 'Tóxico',  colors: ['#39ff14', '#ff00ff', '#00ffff'] },
  { id: 'sunset',  label: 'Sunset',  colors: ['#ff5e5b', '#ffb400', '#ff2e9a'] },
  { id: 'dark',    label: 'Oscuro',  colors: ['#111111', '#ff5a5f', '#ffd23f'] },
]

const LS_KEY = 'rblog:tweaks'

function loadTweaks(): Tweaks {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Tweaks>
      // Migrar dark → magenta si venía de versión anterior
      const palette = parsed.palette ?? 'magenta'
      return { palette: palette as Palette, effectsIntensity: parsed.effectsIntensity ?? 'medium' }
    }
  } catch (_) {}
  return { palette: 'magenta', effectsIntensity: 'medium' }
}

export function TweakPanel() {
  const [open, setOpen] = useState(false)
  const [tweaks, setTweaks] = useState<Tweaks>(loadTweaks)

  useEffect(() => {
    document.documentElement.dataset.palette = tweaks.palette
    document.documentElement.dataset.effects = tweaks.effectsIntensity
    localStorage.setItem(LS_KEY, JSON.stringify(tweaks))
  }, [tweaks])

  const set = (patch: Partial<Tweaks>) => setTweaks(t => ({ ...t, ...patch }))

  return (
    <>
      <button className="tweaks-toggle-btn" onClick={() => setOpen(o => !o)} title="Tweaks">
        {open ? '×' : '✦'}
      </button>
      {open && (
        <div className="tweaks-panel">
          <h3>▸ Tweaks</h3>

          <div className="tweaks-row">
            <label className="field-label">Paleta</label>
            <div className="swatch-row">
              {PALETTES.map(p => (
                <div
                  key={p.id}
                  className={`swatch ${tweaks.palette === p.id ? 'active' : ''}`}
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

          <div className="tweaks-row">
            <label className="field-label">Intensidad de efectos</label>
            <div className="seg">
              {(['low', 'medium', 'high'] as Effects[]).map(lvl => (
                <button
                  key={lvl}
                  className={tweaks.effectsIntensity === lvl ? 'active' : ''}
                  onClick={() => set({ effectsIntensity: lvl })}
                >
                  {lvl === 'low' ? 'Suave' : lvl === 'medium' ? 'Normal' : 'Brutal'}
                </button>
              ))}
            </div>
            <div className="text-xs text-mute mt-2">
              Ajusta el peso visual, sombras y efectos.
            </div>
          </div>

          <div className="text-xs text-mute mt-4" style={{ textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ▒ rael's blogs ▒
          </div>
        </div>
      )}
    </>
  )
}
