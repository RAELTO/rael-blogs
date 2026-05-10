import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { TweakPanel } from './components/ui/TweakPanel'
import { useHeartbeat } from './features/presence/useHeartbeat'
import { FloatingChatProvider } from './features/chat/FloatingChatContext'
import FloatingChats from './components/chat/FloatingChatPanel'
import MessageNotifier from './components/chat/MessageNotifier'
import AppRouter from './app/router'

function Heartbeat() {
  const { user } = useAuth()
  useHeartbeat(user?.id)
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FloatingChatProvider>
          <Heartbeat />
          <MessageNotifier />
          <AppRouter />
          <TweakPanel />
          <FloatingChats />
        </FloatingChatProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
