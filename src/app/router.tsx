import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FloatingChats from '../components/chat/FloatingChatPanel'
import RequireAuth from '../components/auth/RequireAuth'
import HomePage from '../pages/public/HomePage'
import LoginPage from '../pages/public/LoginPage'
import CheckEmailPage from '../pages/public/CheckEmailPage'

const TagPage = lazy(() => import('../pages/public/TagPage'))
const ProfilePage = lazy(() => import('../pages/dashboard/ProfilePage'))
const UserProfilePage = lazy(() => import('../pages/public/UserProfilePage'))
const ContactsPage = lazy(() => import('../pages/dashboard/ContactsPage'))
const InboxPage = lazy(() => import('../pages/dashboard/InboxPage'))
const SavedPage = lazy(() => import('../pages/dashboard/SavedPage'))
const MenuPage = lazy(() => import('../pages/dashboard/MenuPage'))
const BoxPage = lazy(() => import('../pages/public/BoxPage'))
const NotificationsPage = lazy(() => import('../pages/public/NotificationsPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const ResetPasswordPage = lazy(() => import('../pages/public/ResetPasswordPage'))

function Fallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
      loading...
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <FloatingChats />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/reset-password" element={<Suspense fallback={<Fallback />}><ResetPasswordPage /></Suspense>} />
        <Route path="/box/:id" element={<Suspense fallback={<Fallback />}><BoxPage /></Suspense>} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<HomePage />} />
          <Route path="/notifications" element={<Suspense fallback={<Fallback />}><NotificationsPage /></Suspense>} />
          <Route path="/contacts" element={<Suspense fallback={<Fallback />}><ContactsPage /></Suspense>} />
          <Route path="/nbox" element={<Suspense fallback={<Fallback />}><InboxPage /></Suspense>} />
          <Route path="/yo" element={<Suspense fallback={<Fallback />}><MenuPage /></Suspense>} />
          <Route path="/tag/:slug" element={<Suspense fallback={<Fallback />}><TagPage /></Suspense>} />
          <Route path="/my-box" element={<Suspense fallback={<Fallback />}><ProfilePage /></Suspense>} />
          <Route path="/saves" element={<Suspense fallback={<Fallback />}><SavedPage /></Suspense>} />
          <Route path="/profile/:username" element={<Suspense fallback={<Fallback />}><UserProfilePage /></Suspense>} />
        </Route>

        <Route path="/inbox" element={<Navigate to="/nbox" replace />} />
        <Route path="/categories" element={<Navigate to="/explore" replace />} />
        <Route path="/category/:slug" element={<Navigate to="/explore" replace />} />
        <Route path="/post/:slug" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/my-box" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/my-box" replace />} />

        <Route path="*" element={<Suspense fallback={<Fallback />}><NotFoundPage /></Suspense>} />
      </Routes>
    </BrowserRouter>
  )
}
