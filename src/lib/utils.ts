export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function readTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const CHIP_COLORS = ['pink', 'yellow', 'cyan', 'green', 'purple'] as const
export type ChipColor = typeof CHIP_COLORS[number]

export function categoryColor(id: string): ChipColor {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return CHIP_COLORS[sum % CHIP_COLORS.length]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
