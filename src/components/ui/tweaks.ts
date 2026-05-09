type Palette = 'coral' | 'electric' | 'lime' | 'dusk' | 'dark'

const LS_KEY = 'nbox:tweaks'

export const PALETTES: { id: Palette; label: string; colors: string[] }[] = [
  { id: 'coral',    label: 'Coral',    colors: ['#ff5a5f', '#ffd23f', '#4cc9f0'] },
  { id: 'electric', label: 'Electric', colors: ['#ff4dd2', '#00e5ff', '#ffde59'] },
  { id: 'lime',     label: 'Lime',     colors: ['#a6ff00', '#ff00aa', '#00e5ff'] },
  { id: 'dusk',     label: 'Dusk',     colors: ['#c77dff', '#ffb400', '#4cc9f0'] },
  { id: 'dark',     label: 'Dark',     colors: ['#111111', '#ff5a5f', '#ffd23f'] },
]

const PALETTE_ACCENT: Record<Palette, string> = {
  coral:    '#ff5a5f',
  electric: '#ff4dd2',
  lime:     '#a6ff00',
  dusk:     '#c77dff',
  dark:     '#ff5a5f',
}

const PALETTE_INK: Record<Palette, string> = {
  coral:    '#111111',
  electric: '#111111',
  lime:     '#111111',
  dusk:     '#111111',
  dark:     '#f5f0e6',
}

export interface Tweaks {
  palette: Palette
  shadow:  'low' | 'medium' | 'high'
}

export function updateFavicon(palette: Palette) {
  const accent = PALETTE_ACCENT[palette]
  const ink    = PALETTE_INK[palette]
  const svg = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="28" height="28" fill="${ink}"/>
  <rect x="1" y="1" width="28" height="28" fill="${accent}" stroke="${ink}" stroke-width="1.5"/>
  <text x="15" y="23" font-family="'Archivo Black','Arial Black',sans-serif" font-size="17" font-weight="900" fill="${ink}" text-anchor="middle">NB</text>
</svg>`
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url  = URL.createObjectURL(blob)
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (link) {
    const prev = link.href
    link.href = url
    if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)
  }
}

export function loadTweaks(): Tweaks {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<Tweaks & { effectsIntensity: string }>
      return {
        palette: (p.palette ?? 'coral') as Palette,
        shadow:  (p.shadow ?? (p.effectsIntensity === 'low' ? 'low' : p.effectsIntensity === 'high' ? 'high' : 'medium')) as 'low' | 'medium' | 'high',
      }
    }
  } catch { /* use defaults */ }
  return { palette: 'coral', shadow: 'medium' }
}

export function saveTweaks(tweaks: Tweaks) {
  document.documentElement.dataset.palette = tweaks.palette
  document.documentElement.dataset.shadow  = tweaks.shadow
  localStorage.setItem(LS_KEY, JSON.stringify(tweaks))
  updateFavicon(tweaks.palette)
}
