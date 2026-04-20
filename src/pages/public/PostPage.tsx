import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'
import type { Element as HtmlElement } from 'html-react-parser'
import { getVideoEmbedUrl } from '../../lib/videoEmbed'
import VideoEmbed from '../../components/posts/VideoEmbed'
import { usePost } from '../../features/posts/usePost'
import { usePosts } from '../../features/posts/usePosts'
import { useAdminDeletePost } from '../../features/admin/useAdminActions'
import { formatDate, readTime } from '../../lib/utils'
import AppLayout from '../../components/layout/AppLayout'
import Avatar from '../../components/ui/Avatar'
import Chip from '../../components/ui/Chip'
import LikeButton from '../../components/posts/LikeButton'
import BookmarkButton from '../../components/posts/BookmarkButton'
import CommentSection from '../../components/posts/CommentSection'
import AdminOnly from '../../components/auth/AdminOnly'
import AdminBadge from '../../components/ui/AdminBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Icon from '../../components/ui/Icon'
import { useToast } from '../../components/ui/Toast'

export default function PostPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: post, isLoading, isError } = usePost(slug)
  const { data: allPosts = [] } = usePosts()
  const adminDelete = useAdminDeletePost()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="page" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          ▒ cargando...
        </div>
      </AppLayout>
    )
  }

  if (isError || !post) {
    return (
      <AppLayout>
        <div className="page" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>— Post no encontrado —</div>
          <button className="btn mt-4" onClick={() => navigate('/')}>← Volver al feed</button>
        </div>
      </AppLayout>
    )
  }

  const mins = readTime(post.content)
  const date = formatDate(post.published_at ?? post.created_at)
  const related = allPosts.filter(p => p.id !== post.id && p.categories.some(c => post.categories.some(pc => pc.id === c.id))).slice(0, 3)

  const safeHtml = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ['p','br','strong','em','s','u','h2','h3','h4','blockquote','ul','ol','li','code','pre','a','img','hr','table','thead','tbody','tr','th','td','span'],
    ALLOWED_ATTR: ['href','src','alt','target','rel','style','class','colspan','rowspan'],
    FORCE_BODY: true,
  })

  const parsedContent = parse(safeHtml, {
    replace(node) {
      const el = node as HtmlElement
      if (el.type !== 'tag' || el.name !== 'p') return
      const real = el.children?.filter(c => c.type !== 'text' || (c as { data?: string }).data?.trim())
      if (real?.length !== 1) return
      const child = real[0] as HtmlElement
      if (child.type !== 'tag' || child.name !== 'a') return
      const href = child.attribs?.href
      if (!href) return
      const embedUrl = getVideoEmbedUrl(href)
      if (embedUrl) return <VideoEmbed src={embedUrl} />
    },
  })

  const handleAdminDelete = async () => {
    await adminDelete.mutateAsync(post.id)
    toast('Post eliminado')
    navigate('/')
  }

  return (
    <AppLayout>
      <div className="page">
        <button className="btn btn-ghost mb-4" onClick={() => navigate('/')}>
          ← Volver al feed
        </button>

        <div className="two-col">
          {/* Contenido principal */}
          <div>
            <div className="post-meta-row mb-3">
              {post.categories.map(c => <Chip key={c.id} color="pink">{c.name}</Chip>)}
              <span>{date}</span>
              <span>· {mins} min de lectura</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: 1.05, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              {post.title}
            </h1>

            <div className="row gap-3 mb-5" style={{ paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
              <Avatar name={post.author.display_name} size="md" src={post.author.avatar_url} />
              <div>
                <div style={{ fontSize: 14 }}>
                  {post.author.display_name}
                  {post.author.role === 'admin' && <AdminBadge />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  @{post.author.username}
                </div>
              </div>
            </div>

            {post.excerpt && (
              <div style={{
                background: 'var(--bg-panel)',
                border: '2px solid var(--ink)',
                boxShadow: '4px 4px 0 var(--ink)',
                padding: '18px 24px',
                margin: '0 0 20px',
              }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>
                  Resumen
                </div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, fontStyle: 'italic', color: 'var(--ink)' }}>
                  {post.excerpt}
                </p>
              </div>
            )}

            <div style={{
              background: 'var(--bg-panel)',
              border: '2px solid var(--ink)',
              boxShadow: '4px 4px 0 var(--ink)',
              padding: '28px 32px',
              margin: '0 0 28px',
            }}>
              <div className="prose">
                {parsedContent}
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="row gap-2 wrap mt-5">
                {post.tags.map(t => (
                  <Link key={t.id} to={`/tag/${t.slug}`} style={{ textDecoration: 'none' }}>
                    <Chip>#{t.name}</Chip>
                  </Link>
                ))}
              </div>
            )}

            {/* Interacciones */}
            <div className="row gap-3 mt-5" style={{ padding: '16px 18px', border: '1px solid var(--line)', borderRadius: 10, background: 'color-mix(in oklab, var(--bg-panel) 70%, transparent)' }}>
              <LikeButton postId={post.id} />
              <button className="btn" onClick={() => { navigator.clipboard.writeText(window.location.href); toast('Enlace copiado') }}><Icon name="share" size={14} /> Compartir</button>
              <BookmarkButton postId={post.id} />
            </div>

            {/* Acciones admin */}
            <AdminOnly>
              <div className="row gap-2 mt-3" style={{ padding: '12px 16px', border: '2px dashed var(--accent-1)', borderRadius: 8, background: 'color-mix(in oklab, var(--accent-1) 8%, transparent)' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-1)', fontWeight: 700, marginRight: 'auto', alignSelf: 'center' }}>▓ admin</span>
                <button className="btn btn-small" onClick={() => navigate(`/dashboard/posts/${post.id}/edit`)}>
                  <Icon name="edit" size={13} /> Editar
                </button>
                <button className="btn btn-small" style={{ color: 'var(--accent-1)' }} onClick={() => setConfirmDelete(true)} disabled={adminDelete.isPending}>
                  <Icon name="trash" size={13} /> Eliminar
                </button>
              </div>
            </AdminOnly>

            <CommentSection postId={post.id} postAuthorId={post.author.id} />
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sidebar-block">
              <h4>Sobre el autor</h4>
              <div className="row gap-3 mb-3">
                <Avatar name={post.author.display_name} size="md" src={post.author.avatar_url} />
                <div>
                  <div style={{ fontSize: 14 }}>{post.author.display_name}</div>
                  <div className="text-xs text-mute uppercase">@{post.author.username}</div>
                </div>
              </div>
              <Link to={`/author/${post.author.username}`} className="btn btn-small" style={{ width: '100%', justifyContent: 'center', display: 'inline-flex' }}>
                Ver perfil <Icon name="arrowRight" size={12} />
              </Link>
            </div>

            {related.length > 0 && (
              <div className="sidebar-block">
                <h4>▸ relacionados</h4>
                {related.map(r => (
                  <Link key={r.id} to={`/post/${r.slug}`} className="link-card" style={{ textDecoration: 'none' }}>
                    <div className="lc-label">{r.categories[0]?.name}</div>
                    <div className="lc-title">{r.title}</div>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar publicación"
        message={`¿Eliminar "${post.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleAdminDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </AppLayout>
  )
}
