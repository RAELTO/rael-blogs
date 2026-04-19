import { supabase } from './supabase'

const BUCKET = 'post-images'

export const IMAGE_LIMITS = {
  cover: { maxBytes: 1 * 1024 * 1024, label: '1 MB' },
  avatar: { maxBytes: 512 * 1024,     label: '500 KB' },
} as const

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type ImageKind = keyof typeof IMAGE_LIMITS

export interface UploadError {
  type: 'size' | 'format' | 'upload'
  message: string
}

function ext(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
}

export function validateImage(file: File, kind: ImageKind): UploadError | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { type: 'format', message: `Formato no permitido. Usa JPG, PNG, WebP o GIF.` }
  }
  const limit = IMAGE_LIMITS[kind]
  if (file.size > limit.maxBytes) {
    return { type: 'size', message: `La imagen supera el límite de ${limit.label}.` }
  }
  return null
}

export async function uploadCoverImage(file: File, userId: string): Promise<string> {
  const path = `${userId}/posts/${Date.now()}.${ext(file)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (error) throw new Error('Error al subir la imagen.')
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAvatarImage(file: File, userId: string): Promise<string> {
  // upsert: true para reemplazar el avatar anterior sin acumular archivos
  const path = `${userId}/avatar/avatar.${ext(file)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) throw new Error('Error al subir el avatar.')
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  // Cache-bust para que el navegador recargue la imagen
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const urlObj = new URL(url)
    const pathStart = urlObj.pathname.indexOf(`/object/public/${BUCKET}/`)
    if (pathStart === -1) return
    const filePath = urlObj.pathname.slice(pathStart + `/object/public/${BUCKET}/`.length)
    await supabase.storage.from(BUCKET).remove([filePath])
  } catch (_) {}
}
