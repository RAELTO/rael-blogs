import { createContext, useContext, useState } from 'react'

interface ToastContextValue {
  show: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)

  const show = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(null), 1900)
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {msg && <div className="toast">▒ {msg}</div>}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.show
}
