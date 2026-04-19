import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'

export default function CheckEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const navigate = useNavigate()
  const toast = useToast()
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        toast('Bienvenido — cuenta confirmada')
        navigate('/dashboard')
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate, toast])

  const handleResend = async () => {
    if (!email || resending) return
    setResending(true)
    try {
      await supabase.auth.resend({ type: 'signup', email })
      setResent(true)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-shell">
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="hero-grid-bg" />
        <div className="hero-sun" />
      </div>

      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-title">
          <span className="mark">RAEL'S</span>{' '}
          <span>blogs</span>
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 48,
          lineHeight: 1,
          margin: '24px 0 8px',
          letterSpacing: '-0.02em',
        }}>
          ✉
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          margin: '0 0 12px',
          letterSpacing: '-0.01em',
        }}>
          Revisa tu correo
        </h2>

        <p style={{ fontSize: 14, color: 'var(--ink-dim)', lineHeight: 1.6, marginBottom: 6 }}>
          Te enviamos un enlace de confirmación a:
        </p>
        {email && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 700,
            background: 'var(--accent-2)',
            border: '2px solid var(--ink)',
            padding: '6px 14px',
            display: 'inline-block',
            marginBottom: 20,
            boxShadow: '3px 3px 0 var(--ink)',
          }}>
            {email}
          </div>
        )}

        <p style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.6, marginBottom: 28 }}>
          Abre el correo y pulsa <strong>"Confirm your mail"</strong>.<br />
          Esta pestaña se actualizará automáticamente.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {resent ? (
            <div style={{ fontSize: 13, color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              ✓ Correo reenviado
            </div>
          ) : (
            <button
              className="btn"
              onClick={handleResend}
              disabled={resending || !email}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {resending ? '▒ enviando...' : '↺ Reenviar correo'}
            </button>
          )}

          <button
            className="btn btn-ghost"
            onClick={() => navigate('/login')}
            style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
          >
            ← Volver al inicio de sesión
          </button>
        </div>

        <div className="text-xs text-mute mt-4" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          ▒ rael's blogs · ed.001
        </div>
      </div>
    </div>
  )
}
