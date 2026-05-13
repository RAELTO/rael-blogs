import { useRef, useState, type ReactNode } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { ConfirmContext, type ConfirmFn, type ConfirmOptions } from './ConfirmContext'

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmOptions | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm: ConfirmFn = (opts) =>
    new Promise<boolean>(resolve => {
      resolveRef.current = resolve
      setState(opts)
    })

  function handleConfirm() {
    resolveRef.current?.(true)
    resolveRef.current = null
    setState(null)
  }

  function handleCancel() {
    resolveRef.current?.(false)
    resolveRef.current = null
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state !== null}
        title={state?.title ?? ''}
        message={state?.message ?? ''}
        confirmLabel={state?.confirmLabel}
        cancelLabel={state?.cancelLabel}
        danger={state?.danger}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}
