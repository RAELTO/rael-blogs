// Decorative stories rail — visual only for Phase 1, no backend

const STORY_COLORS = [
  'var(--accent-1)',
  'var(--accent-2)',
  'var(--accent-5)',
  'var(--accent-4)',
  'var(--bg-alt)',
]

const STUB_NAMES = ['Ana', 'Kenji', 'Mara', 'Sam', 'Pau']

interface StoriesRailProps {
  onCreateStory?: () => void
}

export default function StoriesRail({ onCreateStory }: StoriesRailProps) {
  return (
    <div className="stories">
      {/* Create story slot — uses gif-shake animation */}
      <div className="story story-create" onClick={onCreateStory} title="Create story">
        <div className="story-create-plus">+</div>
        <div className="story-name">New</div>
      </div>

      {STUB_NAMES.map((name, i) => (
        <div
          key={name}
          className="story"
          style={{ background: STORY_COLORS[i] }}
          title={name}
        >
          <div className="story-avatar">
            {name.charAt(0)}
          </div>
          <div className="story-name">{name}</div>
        </div>
      ))}
    </div>
  )
}
