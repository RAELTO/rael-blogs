import { useState } from 'react'
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom'
import { LogIn, UserPlus, Mail, ArrowLeft } from 'lucide-react'
import NboxLogo from '../../assets/icons/NboxLogo'
import { useSignIn } from '../../features/auth/useSignIn'
import { useSignUp } from '../../features/auth/useSignUp'
import { useSendRecovery } from '../../features/auth/usePasswordRecovery'
import { useToast } from '../../components/ui/Toast'

type Mode = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>((searchParams.get('mode') as Mode) || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [validationError, setValidationError] = useState('')

  const { signIn, loading: loadingIn, error: errorIn, reset: resetIn } = useSignIn()
  const { signUp, loading: loadingUp, error: errorUp, reset: resetUp } = useSignUp()
  const { send: sendRecovery, loading: loadingRecovery, sent: recoverySent, reset: resetRecovery } = useSendRecovery()
  const toast = useToast()
  const navigate = useNavigate()

  const loading = loadingIn || loadingUp || loadingRecovery
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
      setValidationError('Enter your email and password to sign in.')
      return
    }
    if (mode === 'register' && !displayName.trim()) {
      setValidationError('Name is required.')
      return
    }
    if (mode === 'register' && !username.trim()) {
      setValidationError('Username is required.')
      return
    }
    if (mode === 'register' && !pwValid) {
      setValidationError("Password doesn't meet the security requirements.")
      return
    }

    const next = searchParams.get('next') ?? '/'

    if (mode === 'login') {
      const ok = await signIn(email, password)
      if (ok) { toast('Welcome back'); navigate(next, { replace: true }) }
    } else {
      const ok = await signUp(email, password, displayName, username)
      if (ok) { navigate(`/check-email?email=${encodeURIComponent(email)}`) }
    }
  }

  const handleModeChange = (next: Mode) => {
    setMode(next)
    setValidationError('')
    setEmail('')
    setPassword('')
    setDisplayName('')
    setUsername('')
    resetIn()
    resetUp()
    resetRecovery()
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setValidationError('Enter your email.'); return }
    setValidationError('')
    await sendRecovery(email)
  }

  return (
    <div className="auth-shell">
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="hero-grid-bg" />
        <div className="hero-sun" />
      </div>

      <div className="auth-card">
        <div className="auth-title">
          <NavLink to="/" className="brand-logo" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            <span className="brand-mark">
              <NboxLogo style={{ width: 34, height: 34, display: 'block' }} />
            </span>
            <span>NBOX</span>
          </NavLink>
        </div>
        <div className="auth-subtitle">&gt; Neo Brutal Box - Post bold. Drop loud.</div>

        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleModeChange('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleModeChange('register')}
            >
              Create account
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          recoverySent ? (
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>
                Check your email
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.6, marginBottom: 20 }}>
                If an account exists with that email, we will send you a password reset link.
              </p>
              <button
                type="button"
                className="btn"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleModeChange('login')}
              >
                <ArrowLeft size={14} strokeWidth={2.5} /> Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16, letterSpacing: '-0.01em' }}>
                Reset password
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="recovery-email">Email</label>
                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoFocus
                />
              </div>
              {validationError && (
                <div style={{ color: 'var(--accent-1)', fontSize: 12, marginBottom: 14, fontWeight: 700 }}>
                  ! {validationError}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                disabled={loading}
              >
                {loading ? '…' : <><Mail size={15} strokeWidth={2.5} /> Send link</>}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                onClick={() => handleModeChange('login')}
              >
                <ArrowLeft size={14} strokeWidth={2.5} /> Back to sign in
              </button>
            </form>
          )
        )}

        <form onSubmit={handleSubmit} style={{ display: mode === 'forgot' ? 'none' : undefined }}>
          {mode === 'register' && (
            <>
              <div className="field-group">
                <label className="field-label" htmlFor="register-display-name">Name</label>
                <input
                  id="register-display-name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="john_doe33"
                />
              </div>
            </>
          )}

          <div className="field-group">
            <label className="field-label" htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="john-doe@something.com"
            />
          </div>

          <div className="field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <label className="field-label" htmlFor="auth-password" style={{ margin: 0 }}>Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', textDecoration: 'underline', padding: 0 }}
                >
                  Forgot your password?
                </button>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="********"
            />
            {mode === 'register' && password.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {([
                  [pwRules.length,  '8 characters minimum'],
                  [pwRules.upper,   'One uppercase letter'],
                  [pwRules.special, 'One special character (!@#$…)'],
                ] as [boolean, string][]).map(([ok, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 16, height: 16, minWidth: 16,
                      border: '2px solid var(--ink)',
                      boxShadow: '2px 2px 0 var(--ink)',
                      background: ok ? 'var(--accent-4)' : 'var(--accent-1)',
                      fontSize: 12, fontWeight: 900, color: 'var(--ink)',
                      lineHeight: 1,
                    }}>
                      {ok ? 'OK' : 'X'}
                    </span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: ok ? 'var(--ink)' : 'var(--ink-mute)' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: 'var(--accent-1)', fontSize: 12, marginBottom: 14, fontWeight: 700 }}>
              ! {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
            disabled={loading}
          >
            {loading ? '…' : mode === 'login'
              ? <><LogIn size={16} strokeWidth={2.5} /> Go to feed</>
              : <><UserPlus size={16} strokeWidth={2.5} /> Create account</>}
          </button>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {mode === 'login' ? 'New here?' : 'Already have an account?'}
            {' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
