export default function AdminBadge() {
  return (
    <span style={{
      fontSize: 9,
      fontFamily: 'var(--font-mono)',
      fontWeight: 900,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      background: 'var(--accent-1)',
      color: 'var(--bg-panel)',
      border: '1.5px solid var(--ink)',
      boxShadow: '1px 1px 0 var(--ink)',
      padding: '1px 5px',
      marginLeft: 6,
      display: 'inline-block',
      verticalAlign: 'middle',
    }}>
      admin
    </span>
  )
}
