import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BadgePlus, Bookmark, Plus, Share2, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useConfirm } from '../../components/ui/ConfirmContext'
import { useToast } from '../../components/ui/Toast'
import { useSavedBoxes, type SavedBoxItem } from '../../features/saves/useBoxSaves'
import { supabase } from '../../lib/supabase'
import AppShell from '../../components/layout/AppShell'
import LeftSidebar from '../../components/layout/LeftSidebar'
import RightSidebar from '../../components/layout/RightSidebar'
import SavedPostModal from '../../components/feed/SavedPostModal'
import type { BoxWithAuthor, LinkPayload, MediaPayload, MoodPayload } from '../../types/database'

function savedTitle(box: BoxWithAuthor) {
  if (box.type === 'link') return (box.payload as unknown as LinkPayload)?.title ?? box.content
  if (box.type === 'poll') return box.content || 'Poll'
  if (box.type === 'mood') return box.content || 'Mood'
  return box.content || `${box.type} drop`
}

function savedThumb(box: BoxWithAuthor) {
  const payload = box.payload as unknown
  if (box.type === 'media') return (payload as MediaPayload)?.kind === 'image' ? (payload as MediaPayload).url : null
  if (box.type === 'link') return (payload as LinkPayload)?.thumbnail ?? null
  return null
}

function moodColor(box: BoxWithAuthor) {
  const color = (box.payload as unknown as MoodPayload)?.color
  return color === 'm1' ? '#ff5a5f'
    : color === 'm2' ? '#4cc9f0'
    : color === 'm3' ? '#c77dff'
    : color === 'm4' ? '#6ee7b7'
    : '#ffd23f'
}

type SavedFilter = 'all' | 'media' | 'posts' | 'links'

function matchesSavedFilter(box: BoxWithAuthor, filter: SavedFilter) {
  if (filter === 'all') return true
  if (filter === 'media') return box.type === 'media'
  if (filter === 'links') return box.type === 'link'
  return box.type !== 'media' && box.type !== 'link'
}

function SavedCard({ item, onOpen, onUnsave }: {
  item: SavedBoxItem
  onOpen: (box: BoxWithAuthor) => void
  onUnsave: (boxId: string) => void
}) {
  const confirm = useConfirm()
  const toast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const title = savedTitle(item.box)
  const thumb = savedThumb(item.box)

  async function handleUnsave() {
    setMenuOpen(false)
    const ok = await confirm({
      title: 'Remove from saved?',
      message: 'This drop will be removed from your saved items.',
      confirmLabel: 'Remove',
      danger: true,
    })
    if (ok) onUnsave(item.box.id)
  }

  return (
    <article className="saved-card">
      <button className="saved-card-main" type="button" onClick={() => { setMenuOpen(false); onOpen(item.box) }}>
        <div className="saved-card-thumb" style={{ background: item.box.type === 'mood' ? moodColor(item.box) : 'var(--bg-alt)' }}>
          {thumb
            ? <img src={thumb} alt="" width="180" height="120" loading="lazy" />
            : <span>{item.box.type.toUpperCase()}</span>
          }
        </div>
        <div className="saved-card-copy">
          <div className="saved-card-author">{item.box.author.display_name}</div>
          <h3>{title}</h3>
          <p>Drop · {item.box.author.display_name}</p>
          <small>Saved from @{item.box.author.username}</small>
        </div>
      </button>
      <div className="saved-card-actions">
        <button type="button" className="saved-card-collection-action" onClick={() => toast('Collections coming soon.')}>
          <BadgePlus size={16} strokeWidth={2.5} />
          <span>To collection</span>
        </button>
        <button type="button" aria-label="Share" onClick={() => toast('Share coming soon.')}><Share2 size={16} strokeWidth={2.5} /></button>
        <div className="saved-card-more">
          <button type="button" aria-label="More options" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
            <MoreHorizontal size={18} strokeWidth={2.5} />
          </button>
          {menuOpen && (
            <div
              className="panel"
              style={{ position: 'absolute', bottom: 'calc(100% + 4px)', right: 0, zIndex: 'var(--z-dropdown)' as unknown as number, minWidth: 190, padding: 0 }}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                style={{ display: 'block', width: '100%', padding: '11px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--accent-1)', fontSize: 13 }}
                onClick={handleUnsave}
              >
                Remove from saved
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default function SavedPage() {
  const { user } = useAuth()
  const toast = useToast()
  const qc = useQueryClient()
  const { data: saved = [], isLoading, isError } = useSavedBoxes(user?.id)
  const [selectedBox, setSelectedBox] = useState<BoxWithAuthor | null>(null)
  const [filter, setFilter] = useState<SavedFilter>('all')

  const unsave = useMutation({
    mutationFn: async (boxId: string) => {
      await supabase.from('box_saves').delete().eq('box_id', boxId).eq('user_id', user!.id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['box-saves', user?.id] }),
  })
  const collections = useMemo(() => saved.slice(0, 1), [saved])
  const filteredSaved = useMemo(
    () => saved.filter(item => matchesSavedFilter(item.box, filter)),
    [saved, filter]
  )
  const tabs: { id: SavedFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'media', label: 'Media' },
    { id: 'posts', label: 'Posts' },
    { id: 'links', label: 'Links' },
  ]

  return (
    <AppShell left={<LeftSidebar />} right={<RightSidebar />}>
      <div className="saved-layout">
        <aside className="saved-sidebar panel">
          <div className="saved-sidebar-head">
            <h1>Saved</h1>
          </div>
          <div className="saved-sidebar-link active">
            <Bookmark size={18} strokeWidth={2.5} />
            <span>Saved drops</span>
          </div>
          <div className="saved-sidebar-section">My collections</div>
          {collections.length > 0 && (
            <button className="saved-collection" type="button">
              <span className="saved-collection-thumb">L</span>
              <span>
                <strong>For later</strong>
                <small>Only me</small>
              </span>
            </button>
          )}
          <button className="saved-create" type="button" onClick={() => toast('Collections coming soon.')}>
            <Plus size={16} strokeWidth={2.5} />
            Create collection
          </button>
        </aside>

        <section className="saved-content">
          <div className="saved-mobile-head">
            <Link to="/yo" aria-label="Back to menu">
              <ArrowLeft size={24} strokeWidth={2.5} />
            </Link>
            <h1>Saved</h1>
          </div>

          <div className="saved-mobile-tabs" role="tablist" aria-label="Saved filters">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={filter === tab.id ? 'active' : ''}
                role="tab"
                aria-selected={filter === tab.id}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="saved-mobile-collections">
            <div className="saved-mobile-section-title">
              <h2>Collections</h2>
            </div>
            <button className="saved-mobile-create" type="button" onClick={() => toast('Collections coming soon.')}>
              <Plus size={19} strokeWidth={2.5} />
              <span>Create a new collection</span>
            </button>
          </div>

          <div className="saved-content-head">
            <h2>{filter === 'all' ? 'All' : tabs.find(tab => tab.id === filter)?.label}</h2>
          </div>

          {isLoading && <div className="panel saved-empty">Loading saved posts…</div>}
          {isError && <div className="panel saved-empty">Could not load saved posts.</div>}
          {!isLoading && !isError && saved.length === 0 && (
            <div className="panel saved-empty">
              <Bookmark size={56} strokeWidth={1.8} />
              <h3>No saved posts yet</h3>
              <p>Use the post menu and choose Save post.</p>
              <Link className="btn btn-small btn-primary" to="/">Go to feed</Link>
            </div>
          )}
          {!isLoading && !isError && saved.length > 0 && filteredSaved.length === 0 && (
            <div className="panel saved-empty">
              <Bookmark size={56} strokeWidth={1.8} />
              <h3>No saved posts here</h3>
              <p>Try another saved filter.</p>
            </div>
          )}

          <div className="saved-list">
            {filteredSaved.length > 0 && (
              <h2 className="saved-list-title">Saved drops</h2>
            )}
            {filteredSaved.map(item => (
              <SavedCard key={item.box.id} item={item} onOpen={setSelectedBox} onUnsave={(id) => unsave.mutate(id)} />
            ))}
          </div>
        </section>
      </div>

      {selectedBox && (
        <SavedPostModal box={selectedBox} onClose={() => setSelectedBox(null)} />
      )}
    </AppShell>
  )
}
