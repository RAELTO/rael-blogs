import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMyPosts } from '../../features/posts/useMyPosts'
import { useDeletePost } from '../../features/posts/usePostMutations'
import { useAuth } from '../../features/auth/AuthContext'
import { useProfile } from '../../features/profile/useProfile'
import { formatDate } from '../../lib/utils'
import AppLayout from '../../components/layout/AppLayout'
import Avatar from '../../components/ui/Avatar'
import Chip from '../../components/ui/Chip'
import Icon from '../../components/ui/Icon'
import { useToast } from '../../components/ui/Toast'

type Tab = 'posts' | 'drafts'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: profile } = useProfile(user?.id)
  const { data: posts = [], isLoading } = useMyPosts()
  const deletePost = useDeletePost()
  const [tab, setTab] = useState<Tab>('posts')

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    try {
      await deletePost.mutateAsync(id)
      toast('Post eliminado')
    } catch {
      toast('⚠ Error al eliminar')
    }
  }

  const displayName = profile?.display_name ?? user?.user_metadata?.display_name ?? user?.email ?? 'Autor'
  const username = profile?.username ?? ''
  const bio = profile?.bio ?? null

  const published = posts.filter(p => p.status === 'published')
  const drafts = posts.filter(p => p.status === 'draft')
  const totalLikes = posts.reduce((a, p) => a + (p.likes_count ?? 0), 0)
  const totalComments = posts.reduce((a, p) => a + (p.comments_count ?? 0), 0)

  const tabPosts = tab === 'posts' ? published : tab === 'drafts' ? drafts : []

  return (
    <AppLayout>
      <div className="page">
        {/* Cabecera de perfil */}
        <div className="profile-cover mb-4" />

        <div className="row gap-5 wrap mb-6" style={{ marginTop: -50, position: 'relative', padding: '0 16px' }}>
          <Avatar name={displayName} size="lg" src={profile?.avatar_url} />
          <div className="flex-1" style={{ minWidth: 240 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
              <span style={{
                background: 'var(--accent-2)',
                border: '3px solid var(--ink)',
                padding: '2px 10px',
                boxShadow: '4px 4px 0 var(--ink)',
                display: 'inline-block',
                color: 'var(--ink)',
              }}>
                {displayName}
              </span>
            </h1>
            {username && (
              <div className="text-xs text-mute uppercase mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
                @{username} · se sintonizó {formatDate(user?.created_at ?? '')}
              </div>
            )}
            {bio && (
              <p style={{ fontSize: 14, color: 'var(--ink-dim)', marginTop: 10, maxWidth: 620 }}>{bio}</p>
            )}
          </div>
          <div className="row gap-3 items-center wrap">
            <Link to="/dashboard/favorites" className="btn"><Icon name="star" size={14} /> Favoritos</Link>
            <Link to="/dashboard/profile" className="btn"><Icon name="edit" size={14} /> Editar perfil</Link>
            <Link to="/dashboard/posts/new" className="btn btn-primary"><Icon name="plus" size={14} /> Nueva publicación</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="row gap-3 wrap mb-6">
          <div className="stat">
            <div className="stat-value">{posts.length}</div>
            <div className="stat-label">Publicaciones</div>
          </div>
          <div className="stat">
            <div className="stat-value">{totalLikes}</div>
            <div className="stat-label">Likes</div>
          </div>
          <div className="stat">
            <div className="stat-value">{totalComments}</div>
            <div className="stat-label">Comentarios</div>
          </div>
          <div className="stat">
            <div className="stat-value">{published.length}</div>
            <div className="stat-label">Publicadas</div>
          </div>
          <div className="stat">
            <div className="stat-value">{drafts.length}</div>
            <div className="stat-label">Borradores</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row gap-2 mb-5" style={{ borderBottom: '1px solid var(--line)' }}>
          {(['posts', 'drafts'] as Tab[]).map(t => (
            <button
              key={t}
              className={`nav-link ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'posts' ? 'Mis publicaciones' : 'Borradores'}
            </button>
          ))}
        </div>

        {/* Tab: Borradores vacío */}
        {tab === 'drafts' && drafts.length === 0 && !isLoading && (
          <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Sin borradores</div>
            <div className="text-mute mt-3">Cuando guardes un post sin publicar, aparecerá aquí.</div>
            <Link to="/dashboard/posts/new" className="btn btn-primary mt-4" style={{ display: 'inline-flex', marginTop: 20 }}>
              <Icon name="plus" size={14} /> Abrir editor
            </Link>
          </div>
        )}

        {/* Tabla */}
        {(tab !== 'drafts' || drafts.length > 0) && (
          <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                ▒ cargando...
              </div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Estado</th>
                    <th className="col-cat">Categoría</th>
                    <th className="col-likes">Likes</th>
                    <th className="col-comments">Comentarios</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tabPosts.map(p => (
                    <tr key={p.id}>
                      <td style={{ maxWidth: 300 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                        {p.tags.length > 0 && (
                          <div className="text-xs text-mute uppercase mt-2">
                            {p.tags.map(t => '#' + t.name).join(' · ')}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${p.status}`}>
                          {p.status === 'published' ? 'Publicado' : p.status === 'draft' ? 'Borrador' : 'Archivado'}
                        </span>
                      </td>
                      <td className="col-cat">
                        {p.categories[0] && <Chip color="pink">{p.categories[0].name}</Chip>}
                      </td>
                      <td className="col-likes text-mute" style={{ fontSize: 13 }}>{p.likes_count ?? 0}</td>
                      <td className="col-comments text-mute" style={{ fontSize: 13 }}>{p.comments_count ?? 0}</td>
                      <td className="text-mute text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatDate(p.published_at ?? p.created_at)}
                      </td>
                      <td>
                        <div className="row gap-2">
                          {p.status === 'published' && (
                            <button className="btn btn-small btn-ghost" onClick={() => navigate(`/post/${p.slug}`)}><Icon name="eye" size={13} /></button>
                          )}
                          <button className="btn btn-small btn-ghost" onClick={() => navigate(`/dashboard/posts/${p.id}/edit`)}><Icon name="edit" size={13} /></button>
                          <button
                            className="btn btn-small btn-ghost"
                            style={{ color: 'var(--accent-1)' }}
                            onClick={() => handleDelete(p.id, p.title)}
                            disabled={deletePost.isPending}
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tabPosts.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--ink-mute)' }}>
                        Sin publicaciones aún.{' '}
                        <Link to="/dashboard/posts/new" style={{ color: 'var(--accent-1)' }}>¡Crea la primera!</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
