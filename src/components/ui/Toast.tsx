import { createContext, use, useCallback, useMemo, useRef, useState } from 'react'

interface ToastContextValue {
  show: (msg: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback((m: string, duration = 1900) => {
    clearTimeout(timer.current)
    setMsg(m)
    timer.current = setTimeout(() => setMsg(null), duration)
  }, [])

  const ctxValue = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}
      {msg && <div className="toast" role="status" aria-live="polite">▒ {msg}</div>}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = use(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.show
}
