import { AuthProvider } from './features/auth/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { TweakPanel } from './components/ui/TweakPanel'
import AppRouter from './app/router'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
        <TweakPanel />
      </ToastProvider>
    </AuthProvider>
  )
}
