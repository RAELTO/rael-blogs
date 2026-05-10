import { useEffect, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUpdatePassword } from '../../features/auth/usePasswordRecovery'
import { useToast } from '../../components/ui/Toast'
import NboxLogo from '../../assets/icons/NboxLogo'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { update, loading, error } = useUpdatePassword()

  const [ready, setReady]       = useState(false)
  const [expired, setExpired]   = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [localError, setLocalError] = useState('')

  const pwRules = {
    length:  password.length >= 8,
    upper:   /[A-Z]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  }
  const pwValid = pwRules.length && pwRules.upper && pwRules.special

  useEffect(() => {
    // Supabase detecta el token del hash y dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
      if (event === 'SIGNED_OUT')        setExpired(true)
    })

    // Si ya hay sesión de recovery activa (recarga de página)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')

    if (!pwValid) { setLocalError('La contraseña no cumple los requisitos de seguridad.'); return }
    if (password !== confirm) { setLocalError('Las contraseñas no coinciden.'); return }

    const ok = await update(password)
    if (ok) {
      await supabase.auth.signOut()
      toast('Contraseña actualizada. Inicia sesión de nuevo.')
      navigate('/login')
    }
  }

  const displayError = localError || error

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
        <div className="auth-subtitle">▸ Neo Brutal Box · Post bold. Drop loud.</div>

        {/* Token expirado o inválido */}
        {expired && (
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10, color: 'var(--accent-1)' }}>
              Enlace inválido
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.6, marginBottom: 20 }}>
              El enlace de recuperación ha expirado o ya fue utilizado. Solicita uno nuevo.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/login')}>
              Volver al inicio de sesión
            </button>
          </div>
        )}

        {/* Esperando token */}
        {!ready && !expired && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>
            ▒ verificando enlace...
          </div>
        )}

        {/* Formulario de nueva contraseña */}
        {ready && !expired && (
          <form onSubmit={handleSubmit}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20, letterSpacing: '-0.01em' }}>
              Nueva contraseña
            </div>

            <div className="field-group">
              <label className="field-label">Contraseña nueva</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
              {password.length > 0 && (
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
                        border: '2px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)',
                        background: ok ? 'var(--accent-4)' : 'var(--accent-1)',
                        fontSize: 10, fontWeight: 900, color: 'var(--ink)', lineHeight: 1,
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

            <div className="field-group">
              <label className="field-label">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {displayError && (
              <div style={{ color: 'var(--accent-1)', fontSize: 12, marginBottom: 14, fontWeight: 700 }}>
                ⚠ {displayError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
              disabled={loading}
            >
              {loading ? '...' : '✓ Actualizar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
