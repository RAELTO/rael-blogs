import { useParams, useNavigate } from 'react-router-dom'
import { usePostsByAuthor } from '../../features/posts/usePostsByAuthor'
import { useBanUser } from '../../features/admin/useAdminActions'
import { useIsAdmin } from '../../features/auth/useIsAdmin'
import { useToast } from '../../components/ui/Toast'
import AppLayout from '../../components/layout/AppLayout'
import Avatar from '../../components/ui/Avatar'
import AdminOnly from '../../components/auth/AdminOnly'
import PostCard from '../../components/posts/PostCard'

export default function AuthorPage() {
  const { username = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const isAdmin = useIsAdmin()
  const banUser = useBanUser()
  const { data, isLoading, isError } = usePostsByAuthor(username)

  const handleBan = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'desbanear' : 'banear'
    if (!confirm(`¿${action} a @${username}?`)) return
    await banUser.mutateAsync({ userId, ban: !currentlyBanned })
    toast(`Usuario ${currentlyBanned ? 'desbaneado' : 'baneado'}`)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="page" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          ▒ cargando perfil...
        </div>
      </AppLayout>
    )
  }

  if (isError || !data?.author) {
    return (
      <AppLayout>
        <div className="page" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>— Autor no encontrado —</div>
          <button className="btn mt-4" onClick={() => navigate('/')}>← Volver al feed</button>
        </div>
      </AppLayout>
    )
  }

  const { author, posts } = data

  return (
    <AppLayout>
      <div className="page">
        <button className="btn btn-ghost mb-5" onClick={() => navigate(-1)}>← Volver</button>

        {/* Author card */}
        <div className="panel mb-6" style={{ padding: '28px 24px' }}>
          <div className="row gap-5 wrap">
            <Avatar name={author.display_name} size="lg" src={author.avatar_url} />
            <div className="flex-1" style={{ minWidth: 200 }}>
              <div className="hero-eyebrow" style={{ marginBottom: 10 }}>▓ autor</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {author.display_name}
              </h1>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)', letterSpacing: '0.2em', marginBottom: 14 }}>
                @{author.username}
              </div>
              {author.bio && (
                <p style={{ fontSize: 15, color: 'var(--ink-dim)', lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
                  {author.bio}
                </p>
              )}
            </div>
            <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <div className="stat">
                <div className="stat-value">{posts.length}</div>
                <div className="stat-label">Publicaciones</div>
              </div>
              <AdminOnly>
                <button
                  className="btn btn-small"
                  style={{ color: author.is_banned ? 'inherit' : 'var(--accent-1)', borderColor: author.is_banned ? 'var(--line)' : 'var(--accent-1)' }}
                  onClick={() => handleBan(author.id, author.is_banned)}
                  disabled={banUser.isPending}
                >
                  {author.is_banned ? '✓ Desbanear' : '⊘ Banear usuario'}
                </button>
              </AdminOnly>
            </div>
          </div>
        </div>

        {author.is_banned && isAdmin && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: 'color-mix(in oklab, var(--accent-1) 10%, transparent)', border: '2px dashed var(--accent-1)', borderRadius: 8, fontSize: 13, color: 'var(--accent-1)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            ⊘ Este usuario está baneado — sus publicaciones no son visibles para otros usuarios.
          </div>
        )}

        {/* Posts */}
        <h2 className="section-title mb-5">▸ Publicaciones de {author.display_name}</h2>

        {posts.length === 0 ? (
          <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>— Sin publicaciones aún —</div>
            <div className="text-mute mt-3" style={{ fontSize: 14 }}>Este autor no tiene posts publicados todavía.</div>
          </div>
        ) : (
          <div className="feed-grid">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
