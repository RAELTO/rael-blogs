import { useNavigate } from 'react-router-dom'
import type { PostWithMeta } from '../../features/posts/usePosts'
import { formatDate, readTime, categoryColor } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import Chip from '../ui/Chip'
import LikeButton from './LikeButton'
import MediaPlaceholder from './MediaPlaceholder'
import AdminBadge from '../ui/AdminBadge'
import Icon from '../ui/Icon'

interface PostCardProps {
  post: PostWithMeta
  featured?: boolean
}

export default function PostCard({ post, featured }: PostCardProps) {
  const navigate = useNavigate()
  const category = post.categories[0]
  const mins = readTime(post.content)
  const date = formatDate(post.published_at ?? post.created_at)

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') navigate(`/post/${post.slug}`)
  }

  return (
    <article
      className={`card-post ${featured ? 'span-2' : ''}`}
      onClick={() => navigate(`/post/${post.slug}`)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={`Leer: ${post.title}`}
    >
      {post.cover_image_url ? (
        <div style={{ height: featured ? 340 : 200, overflow: 'hidden', borderBottom: 'var(--border)' }}>
          <img
            src={post.cover_image_url}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <MediaPlaceholder
          type={post.cover_type}
          label={category?.name ?? post.title}
          height={featured ? 340 : 200}
        />
      )}

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="post-meta-row" style={{ marginBottom: 8 }}>
          {category && <Chip color={categoryColor(category.id)}>{category.name}</Chip>}
          <span>{date}</span>
          <span>· {mins} min</span>
        </div>

        <h3 className={`post-title ${featured ? 'featured' : ''}`}>{post.title}</h3>
        {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}

        <div className="row gap-3 mt-4" style={{ marginBottom: 14, marginTop: 'auto' }}>
          <Avatar name={post.author.display_name} size="sm" src={post.author.avatar_url} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>
              {post.author.display_name}
              {post.author.role === 'admin' && <AdminBadge />}
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              @{post.author.username}
            </div>
          </div>
        </div>

        <div className="post-actions">
          <LikeButton postId={post.id} small />
          <span className="post-action">
            <Icon name="comment" size={14} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>{post.comments_count ?? 0}</span>
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
            Leer <Icon name="arrowRight" size={12} />
          </span>
        </div>
      </div>
    </article>
  )
}
