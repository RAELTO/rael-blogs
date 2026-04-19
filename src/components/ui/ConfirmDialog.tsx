interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '3px solid var(--ink)',
          boxShadow: '6px 6px 0 var(--ink)',
          padding: '32px 36px',
          maxWidth: 420,
          width: '100%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--ink-mute)',
          marginBottom: 12,
        }}>
          ▓ confirmación requerida
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          letterSpacing: '-0.02em',
          margin: '0 0 14px',
          lineHeight: 1.1,
        }}>
          {title}
        </h2>

        <p style={{
          fontSize: 14,
          color: 'var(--ink-dim)',
          lineHeight: 1.6,
          margin: '0 0 28px',
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
