import type { PollPayload } from '../../types/database'

interface PollBoxContentProps {
  poll: PollPayload
  counts: Record<number, number>
  selectedOption: number | null
  isPending: boolean
  onSelect: (optionIndex: number) => void
}

export default function PollBoxContent({
  poll,
  counts,
  selectedOption,
  isPending,
  onSelect,
}: PollBoxContentProps) {
  const totalVotes = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="poll-wrap" aria-busy={isPending}>
      {poll.options.map((option, optionIndex) => {
        const optionVotes = counts[optionIndex] ?? 0
        const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
        const isSelected = selectedOption === optionIndex
        const voteLabel = `${optionVotes} ${optionVotes === 1 ? 'vote' : 'votes'}`

        return (
          <button
            type="button"
            key={`${option.text}-${optionIndex}`}
            className={`poll-option${isSelected ? ' voted' : ''}`}
            aria-label={`${option.text}, ${voteLabel}${totalVotes > 0 ? `, ${percentage}%` : ''}`}
            aria-pressed={isSelected}
            disabled={isPending}
            onClick={() => onSelect(optionIndex)}
          >
            <span className="poll-bar" style={{ width: `${percentage}%` }} aria-hidden="true" />
            <span className="poll-label">{option.text}</span>
            {totalVotes > 0 && <span className="poll-pct">{percentage}%</span>}
          </button>
        )
      })}
      <div className="poll-meta" aria-live="polite">
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} · {selectedOption === null ? 'tap to vote' : 'tap again to remove'}
      </div>
    </div>
  )
}
