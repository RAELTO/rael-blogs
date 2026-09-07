import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useBox } from '../../features/boxes/useBox'
import { useDeleteBox } from '../../features/boxes/useBoxes'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'
import BoxCard from '../../components/feed/BoxCard'
import CommentsModal from '../../components/feed/CommentsModal'
import { useToast } from '../../components/ui/Toast'

export default function BoxPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const toast = useToast()
  const { data: box, isLoading, isError } = useBox(id ?? '')
  const deleteBox = useDeleteBox()
  const [commentsOpen, setCommentsOpen] = useState(false)

  function handleDelete(boxId: string) {
    deleteBox.mutate(boxId, {
      onSuccess: () => toast('Box deleted.'),
      onError:   () => toast('Failed to delete.'),
    })
  }

  return (
    <>
      <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
        {/* Back nav only for signed-in users */}
        {user && (
          <div style={{ padding: '12px 0 4px' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-dim)',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} strokeWidth={2.5} /> Back to feed
            </Link>
          </div>
        )}

        {isLoading && (
          <div className="spinner">
            <div className="spinner-ring" />
            <span className="spinner-label">▒ Loading drop…</span>
          </div>
        )}

        {isError && (
          <div className="panel" style={{ padding: 40, textAlign: 'center', color: 'var(--accent-1)', fontWeight: 700 }}>
            ⚠ Drop no encontrado.
          </div>
        )}

        {box && (
          <BoxCard
            box={box}
            onDelete={user?.id === box.author_id ? handleDelete : undefined}
          />
        )}

        {/* Open comments button if user closed the modal */}
        {box && !commentsOpen && (
          <button type="button"
            onClick={() => setCommentsOpen(true)}
            style={{
              width: '100%', padding: '12px', border: '2px solid var(--ink)',
              background: 'var(--bg-panel)', cursor: 'pointer', fontWeight: 800,
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.1em',
              textTransform: 'uppercase', marginTop: 8, boxShadow: '3px 3px 0 var(--ink)',
            }}
          >
            VER COMENTARIOS
          </button>
        )}
      </AppShell>

      {/* Comments auto-open when landing on box page via shared link */}
      {box && commentsOpen && (
        <CommentsModal
          boxId={box.id}
          onClose={() => setCommentsOpen(false)}
        />
      )}
    </>
  )
}
