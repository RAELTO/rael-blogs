import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSignIn } from '../../features/auth/useSignIn'
import { useSignUp } from '../../features/auth/useSignUp'
import { useToast } from '../../components/ui/Toast'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>((searchParams.get('mode') as Mode) || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [validationError, setValidationError] = useState('')

  const { signIn, loading: loadingIn, error: errorIn } = useSignIn()
  const { signUp, loading: loadingUp, error: errorUp } = useSignUp()
  const toast = useToast()
  const navigate = useNavigate()

  const loading = loadingIn || loadingUp
  const error = validationError || errorIn || errorUp

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!email.trim() || !password) {
      setValidationError('Introduce correo y contraseña para entrar.')
      return
    }
    if (mode === 'register' && !displayName.trim()) {
      setValidationError('El nombre es obligatorio.')
      return
    }
    if (mode === 'register' && !username.trim()) {
      setValidationError('El nombre de usuario es obligatorio.')
      return
    }

    if (mode === 'login') {
      const ok = await signIn(email, password)
      if (ok) { toast('Bienvenido de vuelta'); navigate('/') }
    } else {
      const ok = await signUp(email, password, displayName, username)
      if (ok) { navigate(`/check-email?email=${encodeURIComponent(email)}`) }
    }
  }

  const handleModeChange = (next: Mode) => {
    setMode(next)
    setValidationError('')
  }

  return (
    <div className="auth-shell">
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="hero-grid-bg" />
        <div className="hero-sun" />
      </div>

      <div className="auth-card">
        <div className="auth-title">
          <span className="mark">RAEL'S</span>{' '}
          <span>blogs</span>
        </div>
        <div className="auth-subtitle">▸ narrativas digitales · multimedia · lógica</div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleModeChange('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleModeChange('register')}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="field-group">
                <label className="field-label">Nombre</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Usuario</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="john_doe33"
                />
              </div>
            </>
          )}

          <div className="field-group">
            <label className="field-label">Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="john-doe@something.com"
            />
          </div>

          <div className="field-group">
            <label className="field-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ color: 'var(--accent-1)', fontSize: 12, marginBottom: 14, fontWeight: 700 }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
            disabled={loading}
          >
            {loading
              ? '...'
              : mode === 'login'
                ? '▶ Entrar al feed'
                : '◉ Crear cuenta'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {mode === 'login' ? '¿Nuevo por aquí?' : '¿Ya tienes cuenta?'}
            {' '}
            <a
              style={{ cursor: 'pointer' }}
              onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
