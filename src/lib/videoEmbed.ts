const ALLOWED_HOSTS = [
  'www.youtube.com', 'youtube.com', 'youtu.be',
  'player.vimeo.com', 'vimeo.com', 'www.vimeo.com',
]

export function getVideoEmbedUrl(url: string): string | null {
  let u: URL
  try { u = new URL(url) } catch { return null }

  if (!ALLOWED_HOSTS.includes(u.hostname)) return null

  // YouTube: youtube.com/watch?v=ID
  if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
    const v = u.searchParams.get('v')
    if (v) return `https://www.youtube.com/embed/${v}`
  }

  // YouTube short: youtu.be/ID
  if (u.hostname === 'youtu.be') {
    const v = u.pathname.slice(1)
    if (v) return `https://www.youtube.com/embed/${v}`
  }

  // Vimeo: vimeo.com/ID
  if (u.hostname === 'vimeo.com' || u.hostname === 'www.vimeo.com') {
    const v = u.pathname.slice(1)
    if (v && /^\d+$/.test(v)) return `https://player.vimeo.com/video/${v}`
  }

  return null
}
