import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { TweakPanel } from './components/ui/TweakPanel'
import { ConfirmProvider } from './components/ui/ConfirmProvider'
import { useHeartbeat } from './features/presence/useHeartbeat'
import { RealtimePresenceProvider } from './features/presence/RealtimePresenceProvider'
import { FloatingChatProvider } from './features/chat/FloatingChatContext'
import MessageNotifier from './components/chat/MessageNotifier'
import NotifNotifier from './components/notifications/NotifNotifier'
import AppRouter from './app/router'

function Heartbeat() {
  const { user } = useAuth()
  useHeartbeat(user?.id)
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <RealtimePresenceProvider>
        <ToastProvider>
          <ConfirmProvider>
          <FloatingChatProvider>
            <Heartbeat />
            <MessageNotifier />
            <NotifNotifier />
            <AppRouter />
            <TweakPanel />
          </FloatingChatProvider>
          </ConfirmProvider>
        </ToastProvider>
      </RealtimePresenceProvider>
    </AuthProvider>
  )
}
