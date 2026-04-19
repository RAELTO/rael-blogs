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

  const pwRules = {
    length:  password.length >= 8,
    upper:   /[A-Z]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  }
  const pwValid = pwRules.length && pwRules.upper && pwRules.special

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
    if (mode === 'register' && !pwValid) {
      setValidationError('La contraseña no cumple los requisitos de seguridad.')
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

      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 20,
          background: 'var(--bg-panel)',
          border: '2px solid var(--ink)',
          boxShadow: '3px 3px 0 var(--ink)',
          padding: '6px 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          color: 'var(--ink)',
          transition: 'box-shadow 0.1s, transform 0.1s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0 var(--ink)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px,2px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 var(--ink)'; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
      >
        ← Volver al feed
      </button>

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
            {mode === 'register' && password.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {([
                  [pwRules.length,  '8 caracteres mínimo'],
                  [pwRules.upper,   'Una mayúscula'],
                  [pwRules.special, 'Un carácter especial (!@#$…)'],
                ] as [boolean, string][]).map(([ok, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 16, height: 16, minWidth: 16,
                      border: '2px solid var(--ink)',
                      boxShadow: '2px 2px 0 var(--ink)',
                      background: ok ? 'var(--accent-4)' : 'var(--accent-1)',
                      fontSize: 10, fontWeight: 900, color: 'var(--ink)',
                      lineHeight: 1,
                    }}>
                      {ok ? '✓' : '✕'}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: ok ? 'var(--ink)' : 'var(--ink-mute)' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
