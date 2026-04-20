import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import AppLayout from '../../components/layout/AppLayout'
import PostEditor from '../../components/posts/PostEditor'
import { type PostWithMeta, type PostJoinRow, mapPostRow } from '../../features/posts/usePosts'

async function fetchMyPostById(id: string): Promise<PostWithMeta | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, content, cover_image_url, cover_type, status, published_at, created_at,
      profiles!author_id (id, display_name, username, avatar_url),
      post_categories (categories (id, name, slug)),
      post_tags (tags (id, name, slug))
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapPostRow(data as unknown as PostJoinRow)
}

export default function EditPostPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: post, isLoading } = useQuery({
    queryKey: ['post-edit', id],
    queryFn: () => fetchMyPostById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <AppLayout>
        <div className="page" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          ▒ cargando...
        </div>
      </AppLayout>
    )
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="page">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>— Post no encontrado —</div>
          <button className="btn mt-4" onClick={() => navigate('/dashboard/posts')}>← Volver</button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PostEditor post={post} />
    </AppLayout>
  )
}
