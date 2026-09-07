import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

interface DialogAccessibilityOptions {
  dialogRef: RefObject<HTMLElement | null>
  onClose: () => void
  initialFocusRef?: RefObject<HTMLElement | null>
  restoreFocusRef?: RefObject<HTMLElement | null>
  active?: boolean
}

/** Adds Escape handling, a focus trap, initial focus, and focus restoration. */
export function useDialogAccessibility({
  dialogRef,
  onClose,
  initialFocusRef,
  restoreFocusRef,
  active = true,
}: DialogAccessibilityOptions) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!active) return

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const explicitRestoreTarget = restoreFocusRef?.current
    const focusFrame = window.requestAnimationFrame(() => {
      const target = initialFocusRef?.current
        ?? dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)
        ?? dialogRef.current
      target?.focus({ preventScroll: true })
    })

    function handleKeyDown(event: KeyboardEvent) {
      const dialog = dialogRef.current
      if (!dialog) return

      const openDialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'))
      if (openDialogs[openDialogs.length - 1] !== dialog) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(element => element.getClientRects().length > 0)
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      const focusTarget = explicitRestoreTarget ?? previouslyFocused
      focusTarget?.focus({ preventScroll: true })
    }
  }, [active, dialogRef, initialFocusRef, restoreFocusRef])
}
