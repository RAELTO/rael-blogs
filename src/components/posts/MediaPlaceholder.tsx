import type { CoverType } from '../../features/posts/usePosts'

interface MediaPlaceholderProps {
  type: CoverType
  label?: string
  height: number
}

const AUDIO_BARS = Array.from({ length: 48 }, (_, i) =>
  12 + Math.abs(Math.sin(i * 0.6)) * 28 + (i % 3) * 4
)

const INFOGRAPHIC_HEIGHTS = [50, 72, 38, 85, 62, 94, 44, 70]

export default function MediaPlaceholder({ type, label, height }: MediaPlaceholderProps) {
  if (type === 'video') {
    return (
      <div className="mp mp-video" style={{ height }}>
        <div className="mp-play-btn" />
        <div className="mp-caption">▶ {label || 'VIDEO'}</div>
      </div>
    )
  }

  if (type === 'gif') {
    return (
      <div className="mp mp-gif" style={{ height }}>
        <span className="mp-label">{label || 'animación'}</span>
      </div>
    )
  }

  if (type === 'infographic') {
    return (
      <div className="mp mp-infographic" style={{ height }}>
        <div className="mp-bars">
          {INFOGRAPHIC_HEIGHTS.map((h, i) => (
            <div key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
        <span className="mp-label mp-label-bottom">{label || 'infografía'}</span>
      </div>
    )
  }

  if (type === 'audio') {
    return (
      <div className="mp mp-audio" style={{ height }}>
        <div className="mp-play-sm">▶</div>
        <div className="mp-waveform">
          {AUDIO_BARS.map((h, i) => (
            <span key={i} style={{ height: `${h}px`, opacity: i < 18 ? 1 : 0.4 }} />
          ))}
        </div>
      </div>
    )
  }

  // 'image' — nunca debería llegar aquí ya que se muestra la imagen real
  return null
}
