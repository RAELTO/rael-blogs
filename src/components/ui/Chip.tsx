type ChipColor = 'pink' | 'yellow' | 'cyan' | 'green' | 'purple' | undefined

interface ChipProps {
  children: React.ReactNode
  color?: ChipColor
  active?: boolean
  onClick?: () => void
}

export default function Chip({ children, color, active, onClick }: ChipProps) {
  const cls = [
    'chip',
    color && `chip-${color}`,
    onClick && 'chip-button',
    active && 'active',
  ].filter(Boolean).join(' ')

  return (
    <span className={cls} onClick={onClick}>
      {children}
    </span>
  )
}
