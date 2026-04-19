import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import HomePage from '../pages/public/HomePage'
import LoginPage from '../pages/public/LoginPage'
import CheckEmailPage from '../pages/public/CheckEmailPage'
import PostPage from '../pages/public/PostPage'
import CategoriesPage from '../pages/public/CategoriesPage'
import CategoryPage from '../pages/public/CategoryPage'
import TagPage from '../pages/public/TagPage'
import AuthorPage from '../pages/public/AuthorPage'

const DashboardPage  = lazy(() => import('../pages/dashboard/DashboardPage'))
const NewPostPage    = lazy(() => import('../pages/dashboard/NewPostPage'))
const EditPostPage   = lazy(() => import('../pages/dashboard/EditPostPage'))
const ProfilePage    = lazy(() => import('../pages/dashboard/ProfilePage'))
const BookmarksPage  = lazy(() => import('../pages/dashboard/BookmarksPage'))

function DashboardFallback() {
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
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/post/:slug" element={<PostPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/tag/:slug" element={<TagPage />} />
        <Route path="/author/:username" element={<AuthorPage />} />

        {/* Privadas — carga diferida */}
        <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<DashboardFallback />}><DashboardPage /></Suspense></ProtectedRoute>} />
        <Route path="/dashboard/posts" element={<ProtectedRoute><Suspense fallback={<DashboardFallback />}><DashboardPage /></Suspense></ProtectedRoute>} />
        <Route path="/dashboard/posts/new" element={<ProtectedRoute><Suspense fallback={<DashboardFallback />}><NewPostPage /></Suspense></ProtectedRoute>} />
        <Route path="/dashboard/posts/:id/edit" element={<ProtectedRoute><Suspense fallback={<DashboardFallback />}><EditPostPage /></Suspense></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><Suspense fallback={<DashboardFallback />}><ProfilePage /></Suspense></ProtectedRoute>} />
        <Route path="/dashboard/favorites" element={<ProtectedRoute><Suspense fallback={<DashboardFallback />}><BookmarksPage /></Suspense></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
