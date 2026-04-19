interface VideoEmbedProps {
  src: string
}

export default function VideoEmbed({ src }: VideoEmbedProps) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingBottom: '56.25%', // 16:9
      border: 'var(--border)',
      boxShadow: 'var(--shadow)',
      marginBlock: '24px',
      overflow: 'hidden',
    }}>
      <iframe
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </div>
  )
}
