import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from '../components/auth/RequireAuth'
import HomePage from '../pages/public/HomePage'
import LoginPage from '../pages/public/LoginPage'
import CheckEmailPage from '../pages/public/CheckEmailPage'

const TagPage           = lazy(() => import('../pages/public/TagPage'))
const ProfilePage       = lazy(() => import('../pages/dashboard/ProfilePage'))
const BoxPage           = lazy(() => import('../pages/public/BoxPage'))
const NotificationsPage = lazy(() => import('../pages/public/NotificationsPage'))
const NotFoundPage      = lazy(() => import('../pages/NotFoundPage'))

function Fallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
      ▒ cargando...
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Públicas (sin auth) ─────────────────────────── */}
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />

        {/* Box permalink — público para links compartidos */}
        <Route path="/box/:id" element={<Suspense fallback={<Fallback />}><BoxPage /></Suspense>} />

        {/* ── Requieren auth ──────────────────────────────── */}
        <Route element={<RequireAuth />}>
          <Route path="/"              element={<HomePage />} />
          <Route path="/explore"       element={<HomePage />} />
          <Route path="/notifications" element={<Suspense fallback={<Fallback />}><NotificationsPage /></Suspense>} />
          <Route path="/tag/:slug"     element={<Suspense fallback={<Fallback />}><TagPage /></Suspense>} />
          <Route path="/my-box"        element={<Suspense fallback={<Fallback />}><ProfilePage /></Suspense>} />
          <Route path="/saves"         element={<Suspense fallback={<Fallback />}><NotFoundPage /></Suspense>} />
          <Route path="/profile/:username" element={<Suspense fallback={<Fallback />}><NotFoundPage /></Suspense>} />
        </Route>

        {/* ── Legacy redirects ────────────────────────────── */}
        <Route path="/categories"     element={<Navigate to="/explore" replace />} />
        <Route path="/category/:slug" element={<Navigate to="/explore" replace />} />
        <Route path="/post/:slug"     element={<Navigate to="/" replace />} />
        <Route path="/dashboard"      element={<Navigate to="/my-box" replace />} />
        <Route path="/dashboard/*"    element={<Navigate to="/my-box" replace />} />

        <Route path="*" element={<Suspense fallback={<Fallback />}><NotFoundPage /></Suspense>} />
      </Routes>
    </BrowserRouter>
  )
}
