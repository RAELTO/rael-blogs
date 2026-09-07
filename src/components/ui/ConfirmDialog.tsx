import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDialogAccessibility } from './useDialogAccessibility'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useDialogAccessibility({ dialogRef: panelRef, onClose: onCancel, active: open })

  if (!open) return null

  return createPortal(
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        ref={panelRef}
        className="confirm-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className="confirm-eyebrow">▓ confirmation required</div>
        <h2 id={titleId} className="confirm-title">{title}</h2>
        <p id={descriptionId} className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn" onClick={onCancel}>{cancelLabel}</button>
          <button type="button"
            className="btn btn-primary"
            style={danger ? { background: 'var(--accent-1)' } : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
