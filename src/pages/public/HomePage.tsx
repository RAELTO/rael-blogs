import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useBoxFeed, useDeleteBox, useSearchBoxes, type FeedMode } from '../../features/boxes/useBoxes'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'
import StoriesRail from '../../components/feed/StoriesRail'
import ComposerCard from '../../components/feed/ComposerCard'
import ModeSelector from '../../components/feed/ModeSelector'
import BoxCard from '../../components/feed/BoxCard'
import DropModal from '../../components/feed/DropModal'
import SearchPeopleResults from '../../components/search/SearchPeopleResults'
import { useToast } from '../../components/ui/Toast'
import type { BoxType } from '../../types/database'

function EmptyFeed({ mode }: { mode: FeedMode }) {
  return (
    <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
      <div className="mp mp-gif" style={{ height: 100, maxWidth: 200, margin: '0 auto 20px', borderBottom: 'none' }} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8 }}>
        {mode === 'following' ? 'Aún no sigues a nadie' : 'Sin boxes aún'}
      </div>
      <div className="text-mute text-sm">
        {mode === 'following'
          ? 'Ve a Explore para encontrar gente que dropea boxes interesantes.'
          : 'Sé el primero en dropear algo brutal.'}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<FeedMode>('foryou')
  const [dropOpen, setDropOpen] = useState<BoxType | null>(null)
  const toast = useToast()
  const searchQuery = (searchParams.get('q') ?? '').trim()
  const hasSearch = searchQuery.length >= 2

  const feedQuery = useBoxFeed(mode, user?.id)
  const searchBoxesQuery = useSearchBoxes(searchQuery)
  const boxes = hasSearch ? searchBoxesQuery.data : feedQuery.data
  const isLoading = hasSearch ? searchBoxesQuery.isLoading : feedQuery.isLoading
  const isError = hasSearch ? searchBoxesQuery.isError : feedQuery.isError
  const deleteBox = useDeleteBox()

  function openDrop(type: BoxType = 'quick') {
    if (!user) { toast('Inicia sesión para dropear.'); return }
    setDropOpen(type)
  }

  function handleDelete(id: string) {
    deleteBox.mutate(id, {
      onSuccess: () => toast('Box eliminada.'),
      onError:   () => toast('Error al eliminar.'),
    })
  }

  return (
    <>
      <AppShell
        left={<LeftSidebar />}
        right={<RightSidebar />}
        onDropClick={() => openDrop('quick')}
      >
        {!hasSearch && (
          <>
            <StoriesRail onCreateStory={() => toast('Stories próximamente')} />
            <ComposerCard onOpenModal={openDrop} />
            <ModeSelector value={mode} onChange={setMode} />
          </>
        )}

        {hasSearch && user?.id && (
          <>
            <div className="search-results-title panel">
              <div>
                <div className="search-results-label">Search results</div>
                <h1>{searchQuery}</h1>
              </div>
            </div>
            <SearchPeopleResults query={searchQuery} userId={user.id} />
            <h2 className="search-posts-title">Posts</h2>
          </>
        )}

        {isLoading && (
          <div className="spinner">
            <div className="spinner-ring" />
            <span className="spinner-label">▒ cargando boxes...</span>
          </div>
        )}

        {isError && (
          <div className="panel" style={{ padding: 40, textAlign: 'center', color: 'var(--accent-1)', fontWeight: 700 }}>
            ⚠ Error al cargar el feed. Intenta de nuevo.
          </div>
        )}

        {!isLoading && !isError && (boxes ?? []).length === 0 && !hasSearch && (
          <EmptyFeed mode={mode} />
        )}

        {!isLoading && !isError && (boxes ?? []).length === 0 && hasSearch && (
          <div className="panel" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>NO POSTS FOUND</div>
            <div className="text-sm text-mute mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
              Try another name, username, tag, or keyword.
            </div>
          </div>
        )}

        {(boxes ?? []).map(box => (
          <BoxCard
            key={box.id}
            box={box}
            onDelete={user?.id === box.author_id ? handleDelete : undefined}
          />
        ))}
      </AppShell>

      {dropOpen && (
        <DropModal
          initialType={dropOpen}
          onClose={() => setDropOpen(null)}
        />
      )}
    </>
  )
}
